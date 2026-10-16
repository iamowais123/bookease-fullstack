/**
 * Admin Promotion Script
 * Usage: npm run promote-admin -- <email>
 * Promotes an existing customer account to admin role.
 */
import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is required. Create backend/.env from .env.example');
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error('❌ Usage: npm run promote-admin -- <email>');
  console.error('   Example: npm run promote-admin -- user@example.com');
  process.exit(1);
}

async function promoteAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model(
      'User',
      new mongoose.Schema({
        name: String,
        email: String,
        role: String,
      })
    );

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`ℹ️ User "${user.name}" (${email}) is already an admin.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log(`\n✅ Successfully promoted "${user.name}" (${email}) to admin role.\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Promotion failed:', error instanceof Error ? error.message : error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

promoteAdmin();
