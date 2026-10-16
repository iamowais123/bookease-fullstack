import { Request, Response, NextFunction } from 'express';
import { Gallery } from '../models/index.js';

const DEFAULT_GALLERY = [
  {
    title: 'French Balayage & Silk Finish',
    category: 'Hair',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
    description: 'Dimensional blonde tones paired with silk smooth blowout.',
    isActive: true,
  },
  {
    title: 'Hydra-Infusion Glow Therapy',
    category: 'Facial',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    description: 'Deep pore extraction and hyaluronic infusion for radiant skin.',
    isActive: true,
  },
  {
    title: 'Precision Bob & Gloss Color',
    category: 'Hair',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    description: 'Architectural sharp bob with mirror-shine color glaze.',
    isActive: true,
  },
  {
    title: 'Aromatherapy Hot Stone Ritual',
    category: 'Spa',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    description: 'Full body stress relief using volcanic basalt stones and lavender oil.',
    isActive: true,
  },
  {
    title: 'Editorial Bridal Styling',
    category: 'Hair',
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80',
    description: 'Soft romantic waves woven with pearl pins for wedding occasions.',
    isActive: true,
  },
  {
    title: 'Collagen Renewal Facial',
    category: 'Facial',
    image: 'https://images.unsplash.com/photo-1512290900672-1f00889cfd31?auto=format&fit=crop&w=800&q=80',
    description: 'Targeted micro-firming treatment activating skin collagen elasticity.',
    isActive: true,
  },
];

export async function getGallery(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let items = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
    if (items.length === 0) {
      await Gallery.insertMany(DEFAULT_GALLERY);
      items = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
    }
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function createGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, category, image, description } = req.body;
    if (!title || !image) {
      res.status(400).json({ message: 'Title and Image URL are required' });
      return;
    }

    const item = await Gallery.create({
      title: title.trim(),
      category: category?.trim() || 'Hair',
      image: image.trim(),
      description: description?.trim() || '',
      isActive: true,
    });

    res.status(201).json({ message: 'Gallery item added successfully', item });
  } catch (error) {
    next(error);
  }
}

export async function deleteGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await Gallery.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: 'Gallery item not found' });
      return;
    }
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    next(error);
  }
}
