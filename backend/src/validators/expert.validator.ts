import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const createExpertSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  role: z.string().trim().min(2, 'Role must be at least 2 characters').max(100),
  experience: z.string().trim().min(1, 'Experience is required').max(50),
  specialty: z.string().trim().min(2, 'Specialty is required').max(150),
  rating: z.coerce.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').default(5.0),
  image: z.string().trim().url('Image must be a valid URL'),
  bio: z.string().trim().max(1000).optional(),
});

export const updateExpertSchema = createExpertSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const expertIdSchema = z.object({
  id: objectId,
});

export type CreateExpertInput = z.infer<typeof createExpertSchema>;
export type UpdateExpertInput = z.infer<typeof updateExpertSchema>;
