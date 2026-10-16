import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  createQuery,
  getAllQueries,
  updateQueryStatus,
  deleteQuery,
} from '../controllers/query.controller.js';
import {
  createQuerySchema,
  updateQueryStatusSchema,
  queryIdSchema,
} from '../validators/query.validator.js';

const router = Router();

// Public endpoint to submit a query
router.post('/', validate(createQuerySchema), createQuery);

// Admin-only endpoints
router.get('/', requireAuth, requireAdmin, getAllQueries);
router.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  validate(queryIdSchema, 'params'),
  validate(updateQueryStatusSchema),
  updateQueryStatus
);
router.delete('/:id', requireAuth, requireAdmin, validate(queryIdSchema, 'params'), deleteQuery);

export default router;
