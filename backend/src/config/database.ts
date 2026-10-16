import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      family: 4, // Force IPv4 to prevent Windows Node 22 OpenSSL/IPv6 TLS alert 80 errors
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error?.message || 'Unknown error');
    if (error?.message?.includes('whitelist') || error?.message?.includes('SSL')) {
      console.error('👉 Tip: Make sure your current IP address is whitelisted in MongoDB Atlas Network Access (or add 0.0.0.0/0).');
    }
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
  });
}
