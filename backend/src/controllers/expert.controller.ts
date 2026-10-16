import { Request, Response, NextFunction } from 'express';
import { Expert } from '../models/index.js';
import type { CreateExpertInput, UpdateExpertInput } from '../validators/expert.validator.js';

// Default luxury stylist experts to seed if database has 0 records
const DEFAULT_EXPERTS = [
  {
    name: 'Elena Rostova',
    role: 'Master Hair Stylist & Creative Director',
    experience: '12+ Years Exp',
    specialty: 'Precision cuts & French Balayage',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    bio: 'Renowned for French Balayage and bespoke couture hairstyling for elite clientele.',
    isActive: true,
  },
  {
    name: 'David Vance',
    role: 'Senior Color Specialist',
    experience: '9+ Years Exp',
    specialty: 'Vibrant hues & Blonde highlights',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Master of corrective coloring, pastel blondes, and hair fiber preservation.',
    isActive: true,
  },
  {
    name: 'Maya Lin',
    role: 'Lead Aesthetician & Spa Director',
    experience: '11+ Years Exp',
    specialty: 'Hydra facials & Ayurvedic wellness',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    bio: 'Specializing in non-invasive skin rejuvenation and holistic aromatherapy treatments.',
    isActive: true,
  },
];

/**
 * GET /api/experts - Get all experts (auto-seeds if empty)
 */
export async function getExperts(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let experts = await Expert.find({ isActive: true }).sort({ createdAt: -1 });

    if (experts.length === 0) {
      await Expert.insertMany(DEFAULT_EXPERTS);
      experts = await Expert.find({ isActive: true }).sort({ createdAt: -1 });
    }

    res.json(experts);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/experts/admin/all - Admin list (includes inactive)
 */
export async function getAllExpertsAdmin(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let experts = await Expert.find().sort({ createdAt: -1 });
    if (experts.length === 0) {
      await Expert.insertMany(DEFAULT_EXPERTS);
      experts = await Expert.find().sort({ createdAt: -1 });
    }
    res.json(experts);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/experts - Admin creates a new expert
 */
export async function createExpert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as CreateExpertInput;

    const expert = await Expert.create({
      ...input,
      isActive: true,
    });

    res.status(201).json({
      message: 'Expert stylist added successfully to database',
      expert,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/experts/:id - Admin updates an expert
 */
export async function updateExpert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const input = req.body as UpdateExpertInput;

    const updated = await Expert.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ message: 'Expert not found' });
      return;
    }

    res.json({
      message: 'Expert updated successfully',
      expert: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/experts/:id - Admin deletes an expert
 */
export async function deleteExpert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await Expert.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: 'Expert not found' });
      return;
    }

    res.json({ message: 'Expert removed successfully from database' });
  } catch (error) {
    next(error);
  }
}
