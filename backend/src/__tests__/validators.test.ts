import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { createBookingSchema } from '../validators/booking.validator.js';
import { createServiceSchema } from '../validators/service.validator.js';

describe('Validation Schemas', () => {
  describe('auth.validator', () => {
    it('validates a strong password and phone during registration', () => {
      const validPayload = {
        name: 'Julie Martin',
        email: 'julie@example.com',
        phone: '+15550188241',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      const result = registerSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects missing or non-10-digit phone during registration', () => {
      const invalidPayload = {
        name: 'Julie Martin',
        email: 'julie@example.com',
        phone: 'eeer',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      const result = registerSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);

      const invalidShort = {
        name: 'Julie Martin',
        email: 'julie@example.com',
        phone: '1234567',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      expect(registerSchema.safeParse(invalidShort).success).toBe(false);
    });

    it('accepts a valid 10-digit phone during registration', () => {
      const valid = registerSchema.safeParse({
        name: 'Julie Martin',
        email: 'julie@example.com',
        phone: '7903541185',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects a weak password during registration', () => {
      const invalidPayload = {
        name: 'Julie Martin',
        email: 'julie@example.com',
        phone: '+15550188241',
        password: 'short',
        confirmPassword: 'short',
      };
      const result = registerSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('validates correct login credentials', () => {
      const valid = loginSchema.safeParse({
        email: 'julie@example.com',
        password: 'Password123!',
      });
      expect(valid.success).toBe(true);
    });
  });

  describe('booking.validator', () => {
    it('validates a valid booking creation payload with required email and phone', () => {
      const payload = {
        serviceId: '507f1f77bcf86cd799439011',
        date: '2026-03-01',
        time: '14:30',
        customerEmail: 'julie@example.com',
        customerPhone: '+15550188241',
      };
      const result = createBookingSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects invalid date format in booking creation', () => {
      const payload = {
        serviceId: '507f1f77bcf86cd799439011',
        date: '01-03-2026',
        time: '14:30',
        customerEmail: 'julie@example.com',
        customerPhone: '+15550188241',
      };
      const result = createBookingSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('query.validator', () => {
    it('validates a valid customer inquiry message', async () => {
      const { createQuerySchema } = await import('../validators/query.validator.js');
      const valid = createQuerySchema.safeParse({
        name: 'Amina Khan',
        email: 'amina@example.com',
        phone: '+15552345678',
        message: 'Do you offer bridal makeup packages for weekend events?',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects inquiry with too short message or invalid email', async () => {
      const { createQuerySchema } = await import('../validators/query.validator.js');
      const invalid = createQuerySchema.safeParse({
        name: 'A',
        email: 'not-an-email',
        message: 'Hi',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('service.validator', () => {
    it('validates valid service creation data', () => {
      const valid = createServiceSchema.safeParse({
        name: 'Hydra Glow Facial',
        description: 'Deep exfoliating and hydrating skin treatment',
        category: 'Facial',
        duration: 60,
        price: 95,
        currency: 'CAD',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects service with negative price', () => {
      const invalid = createServiceSchema.safeParse({
        name: 'Invalid Service',
        description: 'Test',
        category: 'Hair',
        duration: 30,
        price: -10,
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('expert.validator', () => {
    it('validates a valid expert creation payload', async () => {
      const { createExpertSchema } = await import('../validators/expert.validator.js');
      const valid = createExpertSchema.safeParse({
        name: 'Elena Rostova',
        role: 'Master Hair Stylist & Creative Director',
        experience: '12+ Years Exp',
        specialty: 'Precision cuts & French Balayage',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects expert with invalid image URL or out-of-range rating', async () => {
      const { createExpertSchema } = await import('../validators/expert.validator.js');
      const invalid = createExpertSchema.safeParse({
        name: 'Elena Rostova',
        role: 'Stylist',
        experience: '10 Yrs',
        specialty: 'Hair',
        rating: 6.0,
        image: 'not-a-valid-url',
      });
      expect(invalid.success).toBe(false);
    });
  });
});

