import { z } from 'zod';

export const emailSchema = z.string().trim().email('Enter a valid email address.');
export const otpSchema = z.string().trim().regex(/^\d{4,8}$/, 'Enter a valid verification code.');
export const dateOfBirthSchema = z.iso.date('Use YYYY-MM-DD format.');

export const otpRequestSchema = z.object({
  channel: z.enum(['EMAIL', 'SMS']),
  destination: z.string().trim().min(1),
  intent: z.enum(['SIGNUP', 'SIGNIN']),
});
