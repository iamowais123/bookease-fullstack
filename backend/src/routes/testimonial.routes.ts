import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getTestimonials,
  getAllTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonial.controller.js';

const router = Router();

// Public: Get all active featured testimonials
router.get('/', getTestimonials);

// Public / Client: Submit a review / testimonial to the database
router.post('/', createTestimonial);

// Admin: Get all testimonials
router.get('/admin/all', requireAuth, requireAdmin, getAllTestimonialsAdmin);

// Admin: Create testimonial (admin-specific)
router.post('/admin', requireAuth, requireAdmin, createTestimonial);

// Admin: Update testimonial
router.put('/:id', requireAuth, requireAdmin, updateTestimonial);

// Admin: Delete testimonial
router.delete('/:id', requireAuth, requireAdmin, deleteTestimonial);

export default router;
