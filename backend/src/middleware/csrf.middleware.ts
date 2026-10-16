import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_SESSION_KEY = '_csrfToken';

// Methods that need CSRF protection
const PROTECTED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Generate or retrieve CSRF token for the session
 */
export function getCsrfToken(req: Request): string {
  if (!req.session) {
    throw new Error('Session not initialized');
  }

  const session = req.session as unknown as Record<string, unknown>;
  if (!session[CSRF_SESSION_KEY]) {
    session[CSRF_SESSION_KEY] = crypto.randomBytes(32).toString('hex');
  }
  return session[CSRF_SESSION_KEY] as string;
}

/**
 * CSRF token endpoint handler
 */
export function csrfTokenHandler(req: Request, res: Response): void {
  const token = getCsrfToken(req);
  res.json({ csrfToken: token });
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip safe methods
  if (!PROTECTED_METHODS.has(req.method)) {
    next();
    return;
  }

  const session = req.session as unknown as Record<string, unknown>;
  const sessionToken = session[CSRF_SESSION_KEY] as string | undefined;

  if (!sessionToken) {
    res.status(403).json({ message: 'CSRF token not initialized. Please request a token first.' });
    return;
  }

  const headerToken = req.headers[CSRF_TOKEN_HEADER] as string | undefined;

  if (!headerToken) {
    res.status(403).json({ message: 'CSRF token missing from request headers' });
    return;
  }

  // Constant-time comparison
  if (!timingSafeEqual(sessionToken, headerToken)) {
    res.status(403).json({ message: 'Invalid CSRF token' });
    return;
  }

  next();
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}
