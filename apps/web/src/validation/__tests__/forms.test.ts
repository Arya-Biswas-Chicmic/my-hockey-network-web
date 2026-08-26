import { describe, expect, it, vi } from 'vitest';
import {
  validateCreateAccountForm,
  validateGuardianForm,
  validateLoginForm,
  validateSupportTicketForm,
} from '@/validation/forms';

describe('web form validation', () => {
  it('validates login and guardian email consistently', () => {
    expect(validateLoginForm({ email: '' })).toEqual({ email: 'Email Address is required.' });
    expect(validateGuardianForm({ email: '' })).toEqual({ email: 'Parent / Guardian Email is required.' });
    expect(validateLoginForm({ email: 'not-an-email' }).email).toBeTruthy();
    expect(validateGuardianForm({ email: 'player@example.com' })).toEqual({});
  });

  it('validates account names, emails, dates, and role age limits', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-25T12:00:00Z'));
    expect(validateCreateAccountForm({ fullName: '', email: '', dob: '' }, 'player')).toMatchObject({
      fullName: 'Full Name is required.',
      email: 'Email Address is required.',
      dob: 'Date of Birth is required.',
    });
    expect(validateCreateAccountForm({ fullName: 'A', email: 'bad', dob: 'invalid' }, 'player')).toMatchObject({
      fullName: 'Full Name must be at least 2 characters.',
      email: expect.any(String),
      dob: expect.any(String),
    });
    expect(validateCreateAccountForm({ fullName: 'Parent User', email: 'parent@example.com', dob: '25/08/2010' }, 'parent').dob).toContain('18');
    expect(validateCreateAccountForm({ fullName: 'Player User', email: 'player@example.com', dob: '25/08/2023' }, 'player').dob).toContain('Minimum age');
    expect(validateCreateAccountForm({ fullName: 'Player User', email: 'player@example.com', dob: '25/08/2000' }, 'player')).toEqual({});
    vi.useRealTimers();
  });

  it('requires useful support-ticket detail', () => {
    expect(validateSupportTicketForm({ category: 'technical', subject: '', description: '' })).toMatchObject({
      subject: 'Subject is required.',
      description: 'Description is required.',
    });
    expect(validateSupportTicketForm({ category: 'technical', subject: 'Bug', description: 'Too short' })).toMatchObject({
      subject: expect.any(String),
      description: expect.any(String),
    });
    expect(validateSupportTicketForm({ category: 'technical', subject: 'Login problem', description: 'The login page does not accept my verification code.' })).toEqual({});
  });
});
