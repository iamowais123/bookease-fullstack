import { Router } from 'express';
import { register, login, getMe, logout, updateProfile } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', getMe);
router.post('/logout', requireAuth, logout);
router.put('/profile', requireAuth, validate(updateProfileSchema), updateProfile);

export default router;
