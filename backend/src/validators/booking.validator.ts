import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const createBookingSchema = z.object({
  serviceId: objectId,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  customerName: z.string().trim().optional(),
  customerEmail: z.string().trim().email('Valid email is required').toLowerCase().optional(),
  customerPhone: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const bookingIdSchema = z.object({
  id: objectId,
});

export const availabilityQuerySchema = z.object({
  serviceId: objectId,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Status must be one of: confirmed, completed, cancelled' }),
  }),
});

export const createRazorpayOrderSchema = z.object({
  serviceId: objectId,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  customerName: z.string().trim().optional(),
  customerEmail: z.string().trim().email('Valid email is required').toLowerCase().optional(),
  customerPhone: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const verifyPaymentSchema = z.object({
  bookingId: objectId,
  razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay Signature is required'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateRazorpayOrderInput = z.infer<typeof createRazorpayOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

