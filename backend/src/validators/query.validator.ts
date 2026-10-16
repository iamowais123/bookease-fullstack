import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const createQuerySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().email('Valid email is required').toLowerCase(),
  phone: z.string()
    .trim()
    .min(1, 'Phone number is required')
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length === 10 || (digits.length === 12 && digits.startsWith('91')) || (digits.length === 11 && digits.startsWith('1'));
    }, 'Phone number must be exactly 10 digits'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(2000, 'Message is too long'),
});

export const updateQueryStatusSchema = z.object({
  status: z.enum(['new', 'read', 'replied'], {
    errorMap: () => ({ message: 'Status must be new, read, or replied' }),
  }),
});

export const queryIdSchema = z.object({
  id: objectId,
});

export type CreateQueryInput = z.infer<typeof createQuerySchema>;
export type UpdateQueryStatusInput = z.infer<typeof updateQueryStatusSchema>;
