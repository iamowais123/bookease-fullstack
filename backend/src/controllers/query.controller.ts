import { Request, Response, NextFunction } from 'express';
import { Query } from '../models/index.js';
import type { CreateQueryInput, UpdateQueryStatusInput } from '../validators/query.validator.js';

/**
 * POST /api/queries - Public endpoint to submit a query / contact message
 */
export async function createQuery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, phone, message } = req.body as CreateQueryInput;

    const query = await Query.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      message: message.trim(),
      status: 'new',
    });

    res.status(201).json({
      message: 'Thank you! Your inquiry has been received and saved. Our team will contact you shortly.',
      query: {
        id: query._id,
        name: query.name,
        email: query.email,
        phone: query.phone,
        status: query.status,
        createdAt: query.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/queries - Admin endpoint to list all customer queries
 */
export async function getAllQueries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const queries = await Query.find().sort({ createdAt: -1 }).limit(100);
    res.json(queries);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/queries/:id/status - Admin endpoint to update query status
 */
export async function updateQueryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body as UpdateQueryStatusInput;

    const updated = await Query.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ message: 'Query not found' });
      return;
    }

    res.json({
      message: 'Query status updated successfully',
      query: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/queries/:id - Admin endpoint to delete a query
 */
export async function deleteQuery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await Query.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: 'Query not found' });
      return;
    }

    res.json({ message: 'Query deleted successfully' });
  } catch (error) {
    next(error);
  }
}
