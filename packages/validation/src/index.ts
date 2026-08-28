import { emailSchema } from './base';

export * from './base';

export function isEmailValid(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return emailSchema.safeParse(email.trim()).success;
}

export * from './date';
export * from './profileValidation';
export * from './file';
export * from './forms';
