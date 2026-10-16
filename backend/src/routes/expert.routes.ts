import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getExperts,
  getAllExpertsAdmin,
  createExpert,
  updateExpert,
  deleteExpert,
} from '../controllers/expert.controller.js';
import {
  createExpertSchema,
  updateExpertSchema,
  expertIdSchema,
} from '../validators/expert.validator.js';

const router = Router();

// Public: Get all active experts
router.get('/', getExperts);

// Admin: Get all experts (including inactive)
router.get('/admin/all', requireAuth, requireAdmin, getAllExpertsAdmin);

// Admin: Create expert
router.post('/', requireAuth, requireAdmin, validate(createExpertSchema), createExpert);

// Admin: Update expert
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(expertIdSchema, 'params'),
  validate(updateExpertSchema),
  updateExpert
);

// Admin: Delete expert
router.delete('/:id', requireAuth, requireAdmin, validate(expertIdSchema, 'params'), deleteExpert);

export default router;
