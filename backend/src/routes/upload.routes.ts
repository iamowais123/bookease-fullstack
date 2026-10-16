import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadImage } from '../controllers/upload.controller.js';

const router = Router();

// Endpoint for uploading image (available to authenticated users & admins)
router.post('/', requireAuth, uploadImage);

export default router;
