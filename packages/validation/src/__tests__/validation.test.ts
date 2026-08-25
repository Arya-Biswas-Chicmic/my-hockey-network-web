import { describe, expect, it } from 'vitest';
import {
  dateOfBirthSchema,
  emailSchema,
  isEmailValid,
  otpRequestSchema,
  otpSchema,
  sanitizeEmailInput,
  sanitizeNameInput,
  normalizeNameBlur,
  maskEmail,
} from '../index';

describe('shared validation schemas', () => {
  it('normalizes valid emails and rejects invalid emails', () => {
    expect(emailSchema.parse('  player@example.com ')).toBe('player@example.com');
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
    expect(isEmailValid('player@example.com')).toBe(true);
    expect(isEmailValid('not-an-email')).toBe(false);
    expect(isEmailValid('jtyjtyjt')).toBe(false);
    expect(isEmailValid('')).toBe(false);
  });

  it('sanitizes email inputs in real-time by stripping all whitespace', () => {
    expect(sanitizeEmailInput(' john@example.com ')).toBe('john@example.com');
    expect(sanitizeEmailInput('john @example.com')).toBe('john@example.com');
    expect(sanitizeEmailInput('   ')).toBe('');
  });

  it('sanitizes name inputs by preventing leading and multiple consecutive spaces', () => {
    expect(sanitizeNameInput(' John')).toBe('John');
    expect(sanitizeNameInput('John  Doe')).toBe('John Doe');
    expect(sanitizeNameInput('John   Doe  Smith')).toBe('John Doe Smith');
    expect(sanitizeNameInput('John ')).toBe('John ');
    expect(normalizeNameBlur('John Doe ')).toBe('John Doe');
    expect(normalizeNameBlur('  John   Doe  ')).toBe('John Doe');
  });

  it('masks email addresses for OTP display while preserving domain', () => {
    expect(maskEmail('arya2001@gmail.com')).toBe('arya****@gmail.com');
    expect(maskEmail('john.doe@example.com')).toBe('john****@example.com');
    expect(maskEmail('sam@gmail.com')).toBe('sa****@gmail.com');
    expect(maskEmail('ab@gmail.com')).toBe('a****@gmail.com');
    expect(maskEmail('invalid-email')).toBe('invalid-email');
  });

  it('accepts 4-8 digit OTPs only', () => {
    expect(otpSchema.safeParse('1234').success).toBe(true);
    expect(otpSchema.safeParse('12345678').success).toBe(true);
    expect(otpSchema.safeParse('123').success).toBe(false);
    expect(otpSchema.safeParse('12AB56').success).toBe(false);
  });

  it('validates ISO dates and OTP request contracts', () => {
    expect(dateOfBirthSchema.safeParse('2000-02-29').success).toBe(true);
    expect(dateOfBirthSchema.safeParse('29/02/2000').success).toBe(false);
    expect(
      otpRequestSchema.safeParse({ channel: 'EMAIL', destination: 'player@example.com', intent: 'SIGNIN' }).success,
    ).toBe(true);
    expect(
      otpRequestSchema.safeParse({ channel: 'PUSH', destination: '', intent: 'LOGIN' }).success,
    ).toBe(false);
  });
});
