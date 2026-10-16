import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import fs from 'fs';
import path from 'path';

/**
 * Returns configured Cloudinary client reading latest values from .env if in development
 */
export function getCloudinaryClient() {
  let cloudName = env.CLOUDINARY_CLOUD_NAME;
  let apiKey = env.CLOUDINARY_API_KEY;
  let apiSecret = env.CLOUDINARY_API_SECRET;

  if (process.env.NODE_ENV !== 'production') {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('CLOUDINARY_CLOUD_NAME=')) {
            cloudName = trimmed.split('=')[1]?.trim() || cloudName;
          } else if (trimmed.startsWith('CLOUDINARY_API_KEY=')) {
            apiKey = trimmed.split('=')[1]?.trim() || apiKey;
          } else if (trimmed.startsWith('CLOUDINARY_API_SECRET=')) {
            apiSecret = trimmed.split('=')[1]?.trim() || apiSecret;
          }
        }
      }
    } catch {
      // Ignore file read error and use env
    }
  }

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  return { cloudinary, cloudName, apiKey, apiSecret };
}

// Initial configuration
getCloudinaryClient();

export { cloudinary };

