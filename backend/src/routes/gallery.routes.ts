import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getGallery,
  createGalleryItem,
  deleteGalleryItem,
} from '../controllers/gallery.controller.js';

const router = Router();

// Public: Get all active gallery items
router.get('/', getGallery);

// Admin: Add new gallery image
router.post('/', requireAuth, requireAdmin, createGalleryItem);

// Admin: Delete gallery image
router.delete('/:id', requireAuth, requireAdmin, deleteGalleryItem);

export default router;
