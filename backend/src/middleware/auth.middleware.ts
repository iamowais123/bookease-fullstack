import { Request, Response, NextFunction } from 'express';

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    userRole?: string;
  }
}

/**
 * Middleware: Requires an authenticated session
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  next();
}

/**
 * Middleware: Requires admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (req.session.userRole !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
}

/**
 * Middleware: Optionally attaches session info if available
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  // Session data is already available if the user is logged in
  next();
}
