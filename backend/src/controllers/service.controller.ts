import { Request, Response, NextFunction } from 'express';
import { Service } from '../models/index.js';

/**
 * GET /api/services - Public list of active services
 */
export async function getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, search } = req.query;

    const filter: Record<string, unknown> = { isActive: true };

    if (typeof category === 'string' && category.trim()) {
      filter.category = category.trim();
    }

    if (typeof search === 'string' && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    const services = await Service.find(filter).sort({ category: 1, name: 1 });

    res.json({ services });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/services/:id - Public service details
 */
export async function getServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await Service.findOne({ _id: req.params.id, isActive: true });

    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    res.json({ service });
  } catch (error) {
    next(error);
  }
}
