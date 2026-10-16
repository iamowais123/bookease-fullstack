import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url(),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters. Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'),
  SESSION_NAME: z.string().default('bookease.sid'),
  SESSION_MAX_AGE_MS: z.coerce.number().default(604800000), // 7 days
  SESSION_COOKIE_SECURE: z.string().transform(v => v === 'true').default('false'),
  SESSION_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  BCRYPT_ROUNDS: z.coerce.number().min(4).max(20).default(12),
  APP_TIME_ZONE: z.string().default('Asia/Kolkata'),
  TRUST_PROXY: z.coerce.number().default(0),
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_bookeaseDemoKey'),
  RAZORPAY_KEY_SECRET: z.string().default('demoRazorpaySecret12345'),
});

import fs from 'fs';
import path from 'path';

function loadEnv() {
  // Load .env file in non-production
  if (process.env.NODE_ENV !== 'production') {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        // In non-production, .env values update process.env
        process.env[key] = value;
      }
    }
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment validation failed:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  // Warn if SESSION_SECRET looks like a placeholder
  if (result.data.SESSION_SECRET.includes('REPLACE') || result.data.SESSION_SECRET === 'changeme') {
    console.error('❌ SESSION_SECRET must be replaced with a secure random value.');
    console.error('   Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  return result.data;
}

export type Env = z.infer<typeof envSchema>;

// We use top-level await
const env = await (async () => loadEnv())();

export { env };
