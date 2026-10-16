import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Booking, Service, User, VALID_STATUS_TRANSITIONS } from '../models/index.js';
import type { BookingStatus } from '../models/index.js';

/**
 * GET /api/admin/dashboard
 */
export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalCustomers,
      recentBookings,
      totalRevenue,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      User.countDocuments({ role: 'customer' }),
      Booking.find()
        .populate('customer', 'name email')
        .populate('service', 'name category')
        .sort({ createdAt: -1 })
        .limit(10),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$totalPrice', '$price'] } } } },
      ]),
    ]);

    const revenueSum = totalRevenue[0]?.total || 0;

    res.json({
      metrics: {
        totalAppointments: totalBookings,
        upcomingAppointments: confirmedBookings,
        completedAppointments: completedBookings,
        totalRevenue: revenueSum,
        currency: 'CAD',
      },
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalCustomers,
        totalRevenue: revenueSum,
      },
      statusBreakdown: {
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/bookings
 */
export async function getAdminBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;

    const filter: Record<string, unknown> = {};

    if (typeof status === 'string' && ['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    let bookingsQuery = Booking.find(filter)
      .populate('customer', 'name email')
      .populate('service', 'name category duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const [bookings, total] = await Promise.all([
      bookingsQuery,
      Booking.countDocuments(filter),
    ]);

    res.json({
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/bookings/:id/status
 */
export async function updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body as { status: BookingStatus };

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const allowed = VALID_STATUS_TRANSITIONS[booking.status];
    if (!allowed.includes(newStatus)) {
      res.status(400).json({
        message: `Cannot transition from "${booking.status}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}`,
      });
      return;
    }

    booking.status = newStatus;
    await booking.save();

    await booking.populate('customer', 'name email');
    await booking.populate('service', 'name category');

    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/services
 */
export async function getAdminServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const services = await Service.find().sort({ category: 1, name: 1 });
    res.json({ services });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/services
 */
export async function createService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, category, description, price, duration, currency, image, imageUrl, isActive } = req.body;

    const baseSlug = (name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug || `service-${Date.now()}`;
    let counter = 1;
    while (await Service.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const service = await Service.create({
      name,
      slug,
      category,
      description: description || '',
      price: Number(price),
      duration: Number(duration),
      currency: currency || 'CAD',
      image: image || imageUrl || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/services/:id
 */
export async function updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Only allow specific fields
    const allowedFields = ['name', 'category', 'description', 'price', 'duration', 'image', 'isActive'];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    res.json({ message: 'Service updated', service });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/services/:id
 */
export async function deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Soft delete by setting isActive to false
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    res.json({ message: 'Service deactivated', service });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/customers
 */
export async function getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, page = '1', limit = '20' } = req.query;

    const filter: Record<string, unknown> = { role: 'customer' };

    if (typeof search === 'string' && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select('name email avatar role createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({
      customers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}
