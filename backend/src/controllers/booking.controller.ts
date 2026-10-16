import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Booking, Service, User, VALID_STATUS_TRANSITIONS } from '../models/index.js';
import { createAppError } from '../middleware/error.middleware.js';
import { env } from '../config/env.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../config/razorpay.js';
import type {
  CreateBookingInput,
  CreateRazorpayOrderInput,
  VerifyPaymentInput,
} from '../validators/booking.validator.js';

// Business hours: 10:00 AM to 8:00 PM (configurable)
const BUSINESS_START_HOUR = 10;
const BUSINESS_END_HOUR = 20;
const SLOT_INTERVAL = 30; // minutes

/**
 * GET /api/bookings/availability
 */
export async function getAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { serviceId, date } = req.query as { serviceId: string; date: string };

    const service = await Service.findOne({ _id: serviceId, isActive: true });
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    // Parse the date
    const dateObj = new Date(date + 'T00:00:00.000Z');
    const nextDay = new Date(dateObj);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Get existing bookings for this date (non-cancelled)
    const existingBookings = await Booking.find({
      startTime: { $gte: dateObj, $lt: nextDay },
      status: { $nin: ['cancelled'] },
    }).select('startTime endTime');

    // Generate available slots
    const slots: { time: string; available: boolean }[] = [];
    const now = new Date();

    for (let hour = BUSINESS_START_HOUR; hour < BUSINESS_END_HOUR; hour++) {
      for (let min = 0; min < 60; min += SLOT_INTERVAL) {
        const slotStart = new Date(dateObj);
        slotStart.setUTCHours(hour, min, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + service.duration);

        // Check if slot end exceeds business hours
        if (slotEnd.getUTCHours() > BUSINESS_END_HOUR || 
            (slotEnd.getUTCHours() === BUSINESS_END_HOUR && slotEnd.getUTCMinutes() > 0)) {
          continue;
        }

        // Check if slot is in the past
        if (slotStart <= now) {
          slots.push({
            time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
            available: false,
          });
          continue;
        }

        // Check for conflicts with existing bookings
        const hasConflict = existingBookings.some((booking) => {
          return slotStart < booking.endTime && slotEnd > booking.startTime;
        });

        slots.push({
          time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
          available: !hasConflict,
        });
      }
    }

    res.json({
      date,
      service: {
        id: service._id,
        name: service.name,
        duration: service.duration,
        price: service.price,
      },
      slots,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/bookings - Create a new booking
 */
export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.session?.userId;
    if (!customerId) {
      res.status(401).json({ message: 'Authentication required. Please sign in to book an appointment.' });
      return;
    }

    const { serviceId, date, time, customerName, customerEmail, customerPhone, notes } = req.body as CreateBookingInput;

    const customer = await User.findById(customerId);
    if (!customer) {
      res.status(401).json({ message: 'User account not found. Please sign in again.' });
      return;
    }

    const finalEmail = (customerEmail || customer.email)?.trim().toLowerCase();
    const finalPhone = (customerPhone || customer.phone)?.trim();

    if (!finalEmail) {
      res.status(400).json({ message: 'Email Address is required to book an appointment.' });
      return;
    }

    const digits = (finalPhone || '').replace(/\D/g, '');
    const isValid10DigitPhone = digits.length === 10 || (digits.length === 12 && digits.startsWith('91')) || (digits.length === 11 && digits.startsWith('1'));
    if (!finalPhone || !isValid10DigitPhone) {
      res.status(400).json({ message: 'A valid 10-digit Phone Number is required to book an appointment.' });
      return;
    }

    // Save phone to user account if provided/updated
    if (finalPhone && customer.phone !== finalPhone) {
      customer.phone = finalPhone;
      await customer.save();
    }

    // Verify service exists and is active
    const service = await Service.findOne({ _id: serviceId, isActive: true });
    if (!service) {
      res.status(404).json({ message: 'Service not found or not available' });
      return;
    }

    // Parse date and time
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date + 'T00:00:00.000Z');
    startTime.setUTCHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setUTCMinutes(endTime.getUTCMinutes() + service.duration);

    // Validate business hours
    if (hours < BUSINESS_START_HOUR || 
        endTime.getUTCHours() > BUSINESS_END_HOUR ||
        (endTime.getUTCHours() === BUSINESS_END_HOUR && endTime.getUTCMinutes() > 0)) {
      res.status(400).json({ message: 'Selected time is outside business hours (10:00 AM - 8:00 PM)' });
      return;
    }

    // Validate not in the past
    if (startTime <= new Date()) {
      res.status(400).json({ message: 'Cannot book appointments in the past' });
      return;
    }

    // Atomic double-booking prevention using findOneAndUpdate with conflict check
    // We use a transaction-like approach: check and create atomically
    const session = await mongoose.startSession();
    
    try {
      let booking: InstanceType<typeof Booking> | null = null;
      
      await session.withTransaction(async () => {
        // Check for conflicts within the transaction
        const conflict = await Booking.findOne({
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
          status: { $nin: ['cancelled'] },
        }).session(session);

        if (conflict) {
          throw createAppError('This time slot is no longer available', 409);
        }

        // Create booking
        const [created] = await Booking.create(
          [{
            customer: new mongoose.Types.ObjectId(customerId),
            service: service._id,
            startTime,
            endTime,
            price: service.price,
            totalPrice: service.price,
            currency: service.currency || 'CAD',
            notes: notes || '',
            status: 'pending',
          }],
          { session }
        );

        booking = created;
      });

      if (!booking) {
        throw createAppError('Failed to create booking', 500);
      }

      // Populate service and customer info for response
      await (booking as InstanceType<typeof Booking>).populate([
        { path: 'service', select: 'name duration price currency' },
        { path: 'customer', select: 'name email phone' },
      ]);

      res.status(201).json({
        message: 'Booking created successfully',
        booking,
      });
    } catch (txError) {
      if (txError && typeof txError === 'object' && 'isOperational' in txError) {
        throw txError;
      }
      // If transactions aren't supported (standalone MongoDB), fall back to non-transactional
      // Check for conflicts
      const conflict = await Booking.findOne({
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        status: { $nin: ['cancelled'] },
      });

      if (conflict) {
        res.status(409).json({ message: 'This time slot is no longer available' });
        return;
      }

      const booking = await Booking.create({
        customer: new mongoose.Types.ObjectId(customerId),
        service: service._id,
        startTime,
        endTime,
        price: service.price,
        totalPrice: service.price,
        currency: service.currency || 'CAD',
        notes: notes || '',
        status: 'pending',
      });

      await booking.populate([
        { path: 'service', select: 'name duration price currency' },
        { path: 'customer', select: 'name email phone' },
      ]);

      res.status(201).json({
        message: 'Booking created successfully',
        booking,
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/bookings/my - Get current user's bookings
 */
export async function getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.session?.userId;

    const bookings = await Booking.find({ customer: new mongoose.Types.ObjectId(userId) })
      .populate('service', 'name category duration image')
      .sort({ startTime: -1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/bookings/:id - Get booking by ID (owner only)
 */
export async function getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.session?.userId;
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: new mongoose.Types.ObjectId(userId),
    }).populate('service', 'name category duration image price');

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/bookings/:id/cancel - Cancel booking (owner only)
 */
export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.session?.userId;

    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: new mongoose.Types.ObjectId(userId),
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const allowedTransitions = VALID_STATUS_TRANSITIONS[booking.status];
    if (!allowedTransitions.includes('cancelled')) {
      res.status(400).json({ message: `Cannot cancel a booking with status: ${booking.status}` });
      return;
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/bookings/:id - Delete booking record (owner or admin)
 */
export async function deleteBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.session?.userId;
    const userRole = req.session?.userRole;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const query: any = { _id: req.params.id };
    if (userRole !== 'admin') {
      query.customer = new mongoose.Types.ObjectId(userId);
    }

    const booking = await Booking.findOne(query);

    if (!booking) {
      res.status(404).json({ message: 'Appointment not found or unauthorized' });
      return;
    }

    await Booking.findByIdAndDelete(booking._id);

    res.json({ message: 'Appointment deleted successfully', bookingId: req.params.id });
  } catch (error) {
    next(error);
  }
}


/**
 * POST /api/bookings/razorpay-order - Create Razorpay order and reserve slot
 */
export async function createRazorpayOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.session?.userId;
    if (!customerId) {
      res.status(401).json({ message: 'Authentication required. Please sign in to book an appointment.' });
      return;
    }

    const { serviceId, date, time, customerName, customerEmail, customerPhone, notes } =
      req.body as CreateRazorpayOrderInput;

    const customer = await User.findById(customerId);
    if (!customer) {
      res.status(401).json({ message: 'User account not found. Please sign in again.' });
      return;
    }

    const finalEmail = (customerEmail || customer.email)?.trim().toLowerCase();
    const finalPhone = (customerPhone || customer.phone)?.trim();

    if (!finalEmail) {
      res.status(400).json({ message: 'Email Address is required to book an appointment.' });
      return;
    }

    const digits = (finalPhone || '').replace(/\D/g, '');
    const isValid10DigitPhone =
      digits.length === 10 ||
      (digits.length === 12 && digits.startsWith('91')) ||
      (digits.length === 11 && digits.startsWith('1'));

    if (!finalPhone || !isValid10DigitPhone) {
      res.status(400).json({ message: 'A valid 10-digit Phone Number is required to book an appointment.' });
      return;
    }

    // Update user's phone if missing or changed
    if (finalPhone && customer.phone !== finalPhone) {
      customer.phone = finalPhone;
      await customer.save();
    }

    // Verify service
    const service = await Service.findOne({ _id: serviceId, isActive: true });
    if (!service) {
      res.status(404).json({ message: 'Service not found or not available' });
      return;
    }

    // Parse date and time
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date + 'T00:00:00.000Z');
    startTime.setUTCHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setUTCMinutes(endTime.getUTCMinutes() + service.duration);

    // Validate business hours
    if (
      hours < BUSINESS_START_HOUR ||
      endTime.getUTCHours() > BUSINESS_END_HOUR ||
      (endTime.getUTCHours() === BUSINESS_END_HOUR && endTime.getUTCMinutes() > 0)
    ) {
      res.status(400).json({
        message: 'Selected time is outside business hours (10:00 AM - 8:00 PM)',
      });
      return;
    }

    // Validate not in past
    if (startTime <= new Date()) {
      res.status(400).json({ message: 'Cannot book appointments in the past' });
      return;
    }

    // Check for conflicting confirmed/pending bookings
    const conflict = await Booking.findOne({
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $in: ['confirmed', 'completed'] },
    });

    if (conflict) {
      res.status(409).json({ message: 'This time slot is no longer available. Please select another slot.' });
      return;
    }

    // Create pending booking
    const booking = await Booking.create({
      customer: new mongoose.Types.ObjectId(customerId),
      service: service._id,
      startTime,
      endTime,
      price: service.price,
      totalPrice: service.price,
      currency: service.currency || 'INR',
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Create Razorpay Order
    // Razorpay amounts are in the smallest currency unit (paise for INR: 100 paise = 1 INR)
    const amountInPaise = Math.round(service.price * 100);
    const order = await createRazorpayOrder({
      amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${booking._id.toString().slice(-8)}`,
      notes: {
        bookingId: booking._id.toString(),
        serviceName: service.name,
        customerEmail: finalEmail,
      },
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
      isSimulated: order.isSimulated || false,
      serviceName: service.name,
      customer: {
        name: customer.name,
        email: finalEmail,
        phone: finalPhone,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/bookings/verify-payment - Verify Razorpay payment signature & confirm booking
 */
export async function verifyRazorpayPaymentHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.session?.userId;
    if (!customerId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body as VerifyPaymentInput;

    const booking = await Booking.findOne({
      _id: bookingId,
      customer: new mongoose.Types.ObjectId(customerId),
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking reservation not found' });
      return;
    }

    // Verify payment signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      booking.paymentStatus = 'failed';
      await booking.save();
      res.status(400).json({
        message: 'Payment verification failed: Invalid transaction signature.',
      });
      return;
    }

    // Mark appointment as confirmed and payment as paid
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.razorpayOrderId = razorpayOrderId;
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;
    await booking.save();

    await booking.populate([
      { path: 'service', select: 'name duration price currency image' },
      { path: 'customer', select: 'name email phone' },
    ]);

    res.json({
      success: true,
      message: 'Payment verified and appointment confirmed successfully!',
      booking,
    });
  } catch (error) {
    next(error);
  }
}

