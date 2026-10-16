import { z } from 'zod';
import mongoose from 'mongoose';

// Custom Zod validator for MongoDB ObjectId
const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const createServiceSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  category: z.string()
    .trim()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must not exceed 50 characters'),
  description: z.string()
    .trim()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .or(z.literal(''))
    .default(''),
  price: z.number()
    .min(0, 'Price must be non-negative')
    .max(100000, 'Price must not exceed 100000'),
  duration: z.number()
    .int('Duration must be a whole number')
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration must not exceed 480 minutes'),
  currency: z.string().trim().optional().default('CAD'),
  image: z.string().optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const serviceIdSchema = z.object({
  id: objectId,
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
