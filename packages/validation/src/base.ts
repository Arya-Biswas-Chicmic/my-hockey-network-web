import { z } from 'zod';
import { REGEX_PATTERNS } from '@my-hockey-network/constants';

export const emailSchema = z.string().trim().email('Enter a valid email address.');
export const otpSchema = z.string().trim().regex(/^\d{4,8}$/, 'Enter a valid verification code.');
export const sixDigitOtpSchema = z.string().trim().regex(/^\d{6}$/, 'Please fill out all 6 digits of the verification code.');
export const dateOfBirthSchema = z.iso.date('Use YYYY-MM-DD format.');

export function nameSchema(options?: { min?: number; max?: number }) {
  const { min = 2, max = 50 } = options ?? {};
  return z.string().trim()
    .min(min, `Name must be at least ${min} characters.`)
    .max(max, `Name cannot be more than ${max} characters.`)
    .regex(REGEX_PATTERNS.NAME, 'Name can only contain letters, spaces, hyphens, and apostrophes.');
}

export const otpRequestSchema = z.object({
  channel: z.enum(['EMAIL', 'SMS']),
  destination: z.string().trim().min(1),
  intent: z.enum(['SIGNUP', 'SIGNIN']),
});
