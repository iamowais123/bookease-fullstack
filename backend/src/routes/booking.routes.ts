import { Router } from 'express';
import {
  getAvailability,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  deleteBooking,
  createRazorpayOrderHandler,
  verifyRazorpayPaymentHandler,
} from '../controllers/booking.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createBookingSchema,
  bookingIdSchema,
  availabilityQuerySchema,
  createRazorpayOrderSchema,
  verifyPaymentSchema,
} from '../validators/booking.validator.js';

const router = Router();

router.get('/availability', validate(availabilityQuerySchema, 'query'), getAvailability);
router.post('/', requireAuth, validate(createBookingSchema), createBooking);
router.post('/razorpay-order', requireAuth, validate(createRazorpayOrderSchema), createRazorpayOrderHandler);
router.post('/verify-payment', requireAuth, validate(verifyPaymentSchema), verifyRazorpayPaymentHandler);
router.get('/my', requireAuth, getMyBookings);
router.get('/:id', requireAuth, validate(bookingIdSchema, 'params'), getBookingById);
router.post('/:id/cancel', requireAuth, validate(bookingIdSchema, 'params'), cancelBooking);
router.delete('/:id', requireAuth, validate(bookingIdSchema, 'params'), deleteBooking);

export default router;
