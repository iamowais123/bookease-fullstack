import { Router } from 'express';
import { getServices, getServiceById } from '../controllers/service.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { serviceIdSchema } from '../validators/service.validator.js';

const router = Router();

router.get('/', getServices);
router.get('/:id', validate(serviceIdSchema, 'params'), getServiceById);

export default router;
