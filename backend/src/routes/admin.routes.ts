import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getDashboard,
  getAdminBookings,
  updateBookingStatus,
  getAdminServices,
  createService,
  updateService,
  deleteService,
  getCustomers,
} from '../controllers/admin.controller.js';
import { createServiceSchema, updateServiceSchema, serviceIdSchema } from '../validators/service.validator.js';
import { bookingIdSchema, updateBookingStatusSchema } from '../validators/booking.validator.js';

const router = Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// Booking management
router.get('/bookings', getAdminBookings);
router.patch(
  '/bookings/:id/status',
  validate(bookingIdSchema, 'params'),
  validate(updateBookingStatusSchema),
  updateBookingStatus
);

// Service management
router.get('/services', getAdminServices);
router.post('/services', validate(createServiceSchema), createService);
router.patch(
  '/services/:id',
  validate(serviceIdSchema, 'params'),
  validate(updateServiceSchema),
  updateService
);
router.delete(
  '/services/:id',
  validate(serviceIdSchema, 'params'),
  deleteService
);

// Customer management
router.get('/customers', getCustomers);

export default router;
