import { describe, expect, it } from 'vitest';
import { dateOfBirthSchema, emailSchema, otpRequestSchema, otpSchema } from '../index';

describe('shared validation schemas', () => {
  it('normalizes valid emails and rejects invalid emails', () => {
    expect(emailSchema.parse('  player@example.com ')).toBe('player@example.com');
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
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
