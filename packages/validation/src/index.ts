import { z } from 'zod';

export const emailSchema = z.string().trim().email('Enter a valid email address.');
export const otpSchema = z.string().trim().regex(/^\d{4,8}$/, 'Enter a valid verification code.');
export const dateOfBirthSchema = z.iso.date('Use YYYY-MM-DD format.');

export function isEmailValid(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return emailSchema.safeParse(email.trim()).success;
}

export const otpRequestSchema = z.object({
  channel: z.enum(['EMAIL', 'SMS']),
  destination: z.string().trim().min(1),
  intent: z.enum(['SIGNUP', 'SIGNIN']),
});

export * from './profileValidation';
export * from './constants/validationMessages';
export * from './schemas/createAccount.schema';
export * from './schemas/login.schema';
export * from './schemas/otp.schema';
export * from './schemas/guardianApproval.schema';
export * from './schemas/editProfile.schema';
export * from './schemas/career.schema';
export * from './schemas/createPlayer.schema';
export * from './schemas/linkPlayer.schema';
export * from './schemas/approvalCode.schema';
export * from './schemas/helpTicket.schema';
