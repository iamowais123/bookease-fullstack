import { Request, Response, NextFunction } from 'express';
import { getCloudinaryClient } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { image, folder = 'bookease_salon' } = req.body;

    if (!image) {
      res.status(400).json({ message: 'No image data provided for upload' });
      return;
    }

    // Get live Cloudinary configuration (reads from .env dynamically if modified)
    const { cloudinary, cloudName, apiKey, apiSecret } = getCloudinaryClient();
    const isCloudinaryConfigured =
      Boolean(cloudName) &&
      Boolean(apiKey) &&
      Boolean(apiSecret) &&
      apiSecret !== apiKey;

    if (isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.upload(image, {
          folder,
          resource_type: 'auto',
        });

        res.json({
          message: 'Image uploaded to Cloudinary successfully',
          url: result.secure_url,
          public_id: result.public_id,
          storage: 'cloudinary',
        });
        return;
      } catch (cloudErr: any) {
        console.warn('⚠️ Cloudinary upload error:', cloudErr?.message || cloudErr);
      }
    }

    // Local Storage Fallback: Save image to public/uploads/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let buffer: Buffer;
    let ext = 'jpg';

    if (typeof image === 'string' && image.startsWith('data:')) {
      const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        ext = mimeType.split('/')[1] || 'jpg';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(image, 'base64');
      }
    } else if (
      typeof image === 'string' &&
      (image.startsWith('http://') || image.startsWith('https://'))
    ) {
      // If it's already an active web URL, verify and accept it
      res.json({
        message: 'Image URL verified',
        url: image,
        storage: 'url',
      });
      return;
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const filename = `${folder}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `${env.BACKEND_URL}/uploads/${filename}`;

    res.json({
      message: 'Image uploaded successfully',
      url: publicUrl,
      public_id: filename,
      storage: 'local',
    });
  } catch (error: any) {
    next(error);
  }
}
