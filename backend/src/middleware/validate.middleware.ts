import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware factory: Validates request data against a Zod schema
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[target]);
      // Replace the target with parsed (and potentially transformed) data
      (req as unknown as Record<string, unknown>)[target] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        const detailedMsg = errors.map((e) => e.message).filter(Boolean).join('. ');
        res.status(400).json({
          message: detailedMsg || 'Validation failed',
          errors,
        });
        return;
      }
      next(error);
    }
  };
}
