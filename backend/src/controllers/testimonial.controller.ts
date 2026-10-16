import { Request, Response, NextFunction } from 'express';
import { Testimonial } from '../models/index.js';

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Sophie Tremblay',
    comment: 'The French Balayage transformed my hair completely! Elena is truly an artist. The atmosphere is pure luxury and tranquility.',
    rating: 5,
    service: 'French Balayage & Silk Finish',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    isFeatured: true,
  },
  {
    name: 'Marcus Sterling',
    comment: 'Best grooming experience in the city. The precision cut and scalp treatment left me feeling rejuvenated. Highly recommended!',
    rating: 5,
    service: "Gentlemen's Executive Cut",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    isFeatured: true,
  },
  {
    name: 'Aria Montgomery',
    comment: 'The Hydra-Infusion facial gave my skin an unbelievable glass glow for my wedding day. The staff treated me like royalty.',
    rating: 5,
    service: 'Hydra-Infusion Glow Therapy',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    isFeatured: true,
  },
];

/**
 * GET /api/testimonials - Public list of testimonials (seeds if empty)
 */
export async function getTestimonials(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let testimonials = await Testimonial.find({ isFeatured: true }).sort({ createdAt: -1 });
    if (testimonials.length === 0) {
      await Testimonial.insertMany(DEFAULT_TESTIMONIALS);
      testimonials = await Testimonial.find({ isFeatured: true }).sort({ createdAt: -1 });
    }
    res.json(testimonials);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/testimonials/admin/all - Admin list
 */
export async function getAllTestimonialsAdmin(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let testimonials = await Testimonial.find().sort({ createdAt: -1 });
    if (testimonials.length === 0) {
      await Testimonial.insertMany(DEFAULT_TESTIMONIALS);
      testimonials = await Testimonial.find().sort({ createdAt: -1 });
    }
    res.json(testimonials);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/testimonials - Admin create testimonial
 */
export async function createTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, comment, rating, service, avatar } = req.body;
    if (!name || !comment) {
      res.status(400).json({ message: 'Name and comment are required' });
      return;
    }

    const testimonial = await Testimonial.create({
      name: name.trim(),
      comment: comment.trim(),
      rating: Number(rating) || 5,
      service: service?.trim() || 'Signature Spa Treatment',
      avatar: avatar?.trim() || '',
      isFeatured: true,
    });

    res.status(201).json({ message: 'Testimonial created successfully', testimonial });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/testimonials/:id - Admin update testimonial
 */
export async function updateTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, comment, rating, service, avatar, isFeatured } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { $set: { name, comment, rating, service, avatar, isFeatured } },
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }

    res.json({ message: 'Testimonial updated successfully', testimonial });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/testimonials/:id - Admin delete testimonial
 */
export async function deleteTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await Testimonial.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    next(error);
  }
}
