/**
 * Demo Seed Script - Idempotent
 * Seeds sample services, admin/customer accounts, and appointments for BookEase.
 * Safe to run multiple times - uses upsert based on unique keys.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Load .env
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
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookease';

const demoServices = [
  {
    name: 'Signature Haircut & Styling',
    slug: 'signature-haircut-styling',
    category: 'Hair',
    description: 'Precision styling tailored to your facial structure. Includes clarifying shampoo, custom texturizing, and luxury blowout.',
    price: 65,
    currency: 'CAD',
    duration: 45,
    isActive: true,
  },
  {
    name: 'Balayage & Creative Coloring',
    slug: 'balayage-creative-coloring',
    category: 'Color',
    description: 'Hand-painted dimensional highlights using ammonia-free Italian pigments, followed by toner gloss and deep bonding mask.',
    price: 180,
    currency: 'CAD',
    duration: 120,
    isActive: true,
  },
  {
    name: 'Hydra Glow Facial Therapy',
    slug: 'hydra-glow-facial-therapy',
    category: 'Facial',
    description: 'Vortex suction infusion with hyaluronic serum, peptide booster, and LED light therapy for a radiant, glass-skin finish.',
    price: 120,
    currency: 'CAD',
    duration: 60,
    isActive: true,
  },
  {
    name: 'Keratin Smooth Treatment',
    slug: 'keratin-smooth-treatment',
    category: 'Hair',
    description: 'Eliminates 95% of frizz and seals the cuticle with organic botanical keratin. Leaves hair silky and manageable for 3 months.',
    price: 220,
    currency: 'CAD',
    duration: 150,
    isActive: true,
  },
  {
    name: 'Botanical Hair & Scalp Spa',
    slug: 'botanical-hair-scalp-spa',
    category: 'Spa',
    description: 'Deep exfoliating scalp scrub with aromatherapy steam therapy, Japanese head massage, and botanical reconstructive treatment.',
    price: 95,
    currency: 'CAD',
    duration: 60,
    isActive: true,
  },
  {
    name: 'Beard Sculpting & Hot Towel',
    slug: 'beard-sculpting-hot-towel',
    category: 'Hair',
    description: 'Precision razor line work, organic beard oil hydration massage, and aromatic eucalyptus hot towel therapy.',
    price: 45,
    currency: 'CAD',
    duration: 30,
    isActive: true,
  },
];

async function seed() {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Models
    const UserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
      phone: String,
    }, { timestamps: true });

    const ServiceSchema = new mongoose.Schema({
      name: String,
      slug: { type: String, unique: true },
      category: String,
      description: String,
      price: Number,
      currency: { type: String, default: 'CAD' },
      duration: Number,
      isActive: { type: Boolean, default: true },
    }, { timestamps: true });

    const BookingSchema = new mongoose.Schema({
      customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
      startTime: Date,
      endTime: Date,
      status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
      totalPrice: Number,
      currency: { type: String, default: 'CAD' },
      notes: String,
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
    const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

    // 1. Seed Services
    console.log('\n--- Seeding Services ---');
    const serviceDocs: any = {};
    for (const svc of demoServices) {
      const doc = await Service.findOneAndUpdate(
        { slug: svc.slug },
        { $set: svc },
        { upsert: true, new: true }
      );
      serviceDocs[svc.slug] = doc;
      console.log(`  ✓ Service: ${svc.name} ($${svc.price} CAD)`);
    }

    // 2. Seed Users
    console.log('\n--- Seeding Demo Accounts ---');
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@bookease.com' },
      {
        $set: {
          name: 'Timlyst Admin',
          email: 'admin@bookease.com',
          password: passwordHash,
          role: 'admin',
          phone: '+1 (555) 010-0001',
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Admin: admin@bookease.com (Password: Password123!)`);

    const customerUser = await User.findOneAndUpdate(
      { email: 'customer@bookease.com' },
      {
        $set: {
          name: 'Julie Martin',
          email: 'customer@bookease.com',
          password: passwordHash,
          role: 'customer',
          phone: '+1 (555) 018-8241',
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Customer: customer@bookease.com (Password: Password123!)`);

    const customerJohn = await User.findOneAndUpdate(
      { email: 'john@bookease.com' },
      {
        $set: {
          name: 'John Doe',
          email: 'john@bookease.com',
          password: passwordHash,
          role: 'customer',
          phone: '+1 (555) 019-2819',
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Customer: john@bookease.com (Password: Password123!)`);

    // 3. Seed Appointments (Matching Screenshot 1 for February 2026)
    console.log('\n--- Seeding Sample Appointments ---');
    const haircutSvc = serviceDocs['signature-haircut-styling'] || Object.values(serviceDocs)[0];
    const facialSvc = serviceDocs['hydra-glow-facial-therapy'] || Object.values(serviceDocs)[1];
    const balayageSvc = serviceDocs['balayage-creative-coloring'] || Object.values(serviceDocs)[2];

    const sampleBookings = [
      {
        customer: customerJohn._id,
        service: haircutSvc._id,
        startTime: new Date('2026-02-04T05:00:00.000Z'),
        endTime: new Date('2026-02-04T05:45:00.000Z'),
        status: 'confirmed',
        totalPrice: haircutSvc.price,
        currency: 'CAD',
        notes: 'Preferred stylist Elena',
      },
      {
        customer: customerUser._id,
        service: facialSvc._id,
        startTime: new Date('2026-02-05T11:00:00.000Z'),
        endTime: new Date('2026-02-05T12:00:00.000Z'),
        status: 'confirmed',
        totalPrice: facialSvc.price,
        currency: 'CAD',
        notes: 'Pre-wedding facial treatment',
      },
      {
        customer: customerJohn._id,
        service: balayageSvc._id,
        startTime: new Date('2026-02-10T15:00:00.000Z'),
        endTime: new Date('2026-02-10T17:00:00.000Z'),
        status: 'pending',
        totalPrice: balayageSvc.price,
        currency: 'CAD',
        notes: 'Touch-up coloring',
      },
    ];

    for (const b of sampleBookings) {
      await Booking.findOneAndUpdate(
        { customer: b.customer, startTime: b.startTime },
        { $set: b },
        { upsert: true }
      );
    }
    console.log(`  ✓ Seeded sample appointments for schedule calendar matching visual design`);

    console.log(`\n🎉 BookEase Seed Successful!\n`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error instanceof Error ? error.message : error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
