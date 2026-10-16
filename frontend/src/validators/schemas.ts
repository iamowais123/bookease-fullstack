import { z } from 'zod';

/**
 * 10-digit Phone Number validation schema
 * Supports 10 numeric digits, or standard international prefixes (+91, +1) followed by 10 digits.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .refine((val) => {
    const digits = val.replace(/\D/g, '');
    return (
      digits.length === 10 ||
      (digits.length === 12 && digits.startsWith('91')) ||
      (digits.length === 11 && digits.startsWith('1'))
    );
  }, 'Phone number must be exactly 10 digits');

/**
 * Registration form validation schema
 */
export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .regex(/^[a-zA-Z\s'.]+$/, 'Name can only contain letters and spaces (no numbers allowed)'),
    email: z
      .string()
      .trim()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address (e.g. name@example.com)')
      .toLowerCase()
      .refine(
        (val) => !/^\d+$/.test(val),
        'Email address cannot be just numbers. Please enter a valid email address.'
      ),
    phone: phoneSchema,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter (A-Z)')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter (a-z)')
      .regex(/[0-9]/, 'Password must include at least one number (0-9)'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Login form validation schema
 */
export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Contact Query form validation schema
 */
export const contactQueryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  phone: phoneSchema,
  message: z
    .string()
    .trim()
    .min(5, 'Message must be at least 5 characters')
    .max(2000, 'Message cannot exceed 2000 characters'),
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type ContactQueryFormData = z.infer<typeof contactQueryFormSchema>;
