import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { env } from '../config/env.js';
import { createAppError } from '../middleware/error.middleware.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';

/**
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, phone } = req.body as RegisterInput;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'customer',
    });

    // Regenerate session after auth
    req.session.regenerate((err) => {
      if (err) {
        next(createAppError('Session error', 500));
        return;
      }

      req.session.userId = user._id.toString();
      req.session.userRole = user.role;

      req.session.save((saveErr) => {
        if (saveErr) {
          next(createAppError('Session save error', 500));
          return;
        }

        res.status(201).json({
          message: 'Registration successful',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
          },
        });
      });
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as LoginInput;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
      // Generic message to avoid account enumeration
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Regenerate session
    req.session.regenerate((err) => {
      if (err) {
        next(createAppError('Session error', 500));
        return;
      }

      req.session.userId = user._id.toString();
      req.session.userRole = user.role;

      req.session.save((saveErr) => {
        if (saveErr) {
          next(createAppError('Session save error', 500));
          return;
        }

        res.json({
          message: 'Login successful',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
          },
        });
      });
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.session?.userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      // User was deleted but session exists
      req.session.destroy(() => {});
      res.status(401).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionName = env.SESSION_NAME;
    req.session.destroy((err) => {
      if (err) {
        next(createAppError('Logout failed', 500));
        return;
      }

      res.clearCookie(sessionName, {
        httpOnly: true,
        secure: env.SESSION_COOKIE_SECURE,
        sameSite: env.SESSION_COOKIE_SAME_SITE,
      });

      res.json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/profile
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Only allow updating name and avatar - never role or privileged fields
    const allowedFields: Record<string, unknown> = {};
    if (req.body.name !== undefined) allowedFields.name = req.body.name;
    if (req.body.avatar !== undefined) allowedFields.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: allowedFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
}
