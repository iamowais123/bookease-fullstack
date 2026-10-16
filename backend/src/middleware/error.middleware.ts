import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export function createAppError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const isOperational = 'isOperational' in err ? err.isOperational : false;

  // Log unexpected errors
  if (!isOperational) {
    console.error('Unexpected error:', err.message);
    // Don't log stack traces with potential secrets
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const mongooseErrors = Object.values((err as any).errors || {}).map((e: any) => e.message).filter(Boolean);
    const message = mongooseErrors.join('. ') || err.message || 'Validation error';
    res.status(400).json({
      message,
      errors: mongooseErrors.length > 0 ? mongooseErrors : err.message,
    });
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoServerError' && 'code' in err && (err as Record<string, unknown>).code === 11000) {
    const keyPattern = (err as any).keyPattern ? Object.keys((err as any).keyPattern).join(', ') : 'email';
    res.status(409).json({
      message: `An account with this ${keyPattern} already exists. Please sign in or use a different ${keyPattern}.`,
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      message: 'Invalid ID format',
    });
    return;
  }

  res.status(statusCode).json({
    message: isOperational ? err.message : 'An unexpected error occurred',
  });
}
