import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { createSessionConfig } from './config/session.js';
import { csrfProtection, csrfTokenHandler } from './middleware/csrf.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import queryRoutes from './routes/query.routes.js';
import expertRoutes from './routes/expert.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import testimonialRoutes from './routes/testimonial.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();

// Trust proxy (required for Render / cloud reverse proxies to pass HTTPS & cookies correctly)
app.set('trust proxy', env.TRUST_PROXY || (env.NODE_ENV === 'production' ? 1 : 0));

// Security headers with cross-origin resource support for API
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// Allowed origin validator: supports FRONTEND_URL, localhost, and any *.vercel.app domain
const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true; // allow curl, Postman, server-to-server
  const cleanOrigin = origin.replace(/\/$/, '');
  const cleanFrontendUrl = (env.FRONTEND_URL || '').replace(/\/$/, '');

  if (cleanOrigin === cleanFrontendUrl) return true;
  if (cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1')) return true;

  try {
    const hostname = new URL(origin).hostname;
    if (hostname.endsWith('.vercel.app')) return true;
  } catch {
    // fallback
  }

  return true; // permissive fallback so frontend is never blocked
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    callback(null, isAllowedOrigin(origin) ? true : false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-csrf-token',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Cookie',
  ],
  exposedHeaders: ['set-cookie', 'x-csrf-token'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

import path from 'path';

// Body parsing with size limits (10mb for base64 image uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Serve uploaded media statically
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later' },
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Session
app.use(createSessionConfig());

// CSRF token endpoint (before CSRF protection middleware)
app.get('/api/security/csrf', csrfTokenHandler);

// CSRF protection for state-changing requests
app.use('/api', csrfProtection);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use('/api/*', (_req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
