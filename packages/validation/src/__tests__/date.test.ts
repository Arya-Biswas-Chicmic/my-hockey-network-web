import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProfileValidationMessages } from '@my-hockey-network/contracts';
import {
  ageFromDate,
  ageFromDob,
  isFutureDate,
  parseDob,
  validateProfileField,
  parentOnboardingPlayerDetailsFormSchema,
  createAccountFormSchema,
  createPostFormSchema,
} from '../index';
import { CreatePostAudienceEnum } from '@my-hockey-network/contracts';

/** Pins "now" so age assertions do not drift with the real clock. */
function freezeNow(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('parseDob', () => {
  it('parses both accepted formats into the same calendar date', () => {
    expect(parseDob('05/03/2010', 'DD/MM/YYYY')?.getFullYear()).toBe(2010);
    expect(parseDob('05/03/2010', 'DD/MM/YYYY')?.getMonth()).toBe(2); // March
    expect(parseDob('05/03/2010', 'DD/MM/YYYY')?.getDate()).toBe(5);

    expect(parseDob('2010-03-05', 'YYYY-MM-DD')?.getMonth()).toBe(2);
    expect(parseDob('2010-03-05', 'YYYY-MM-DD')?.getDate()).toBe(5);
  });

  it('accepts single-digit day and month in DD/MM/YYYY', () => {
    expect(parseDob('5/3/2010', 'DD/MM/YYYY')?.getDate()).toBe(5);
  });

  it('auto-detects the format when none is supplied', () => {
    expect(parseDob('05/03/2010')?.getMonth()).toBe(2);
    expect(parseDob('2010-03-05')?.getMonth()).toBe(2);
  });

  it('rejects a value that does not match the requested format', () => {
    expect(parseDob('2010-03-05', 'DD/MM/YYYY')).toBeNull();
    expect(parseDob('05/03/2010', 'YYYY-MM-DD')).toBeNull();
  });

  // The previous `new Date(value)` implementations accepted all of these.
  it('rejects loose values the engine would otherwise coerce', () => {
    expect(parseDob('2010')).toBeNull();
    expect(parseDob('March 5, 2010')).toBeNull();
    expect(parseDob('invalid-date')).toBeNull();
    expect(parseDob('')).toBeNull();
    expect(parseDob('   ')).toBeNull();
  });

  it('rejects US month-first ordering rather than silently reinterpreting it', () => {
    // 13 is not a valid month, so this can only be M/D/Y — it must not parse.
    expect(parseDob('05/13/2010', 'DD/MM/YYYY')).toBeNull();
  });

  it('rejects calendar overflow instead of rolling it into the next month', () => {
    expect(parseDob('31/02/2010', 'DD/MM/YYYY')).toBeNull();
    expect(parseDob('30/02/2010', 'DD/MM/YYYY')).toBeNull();
    expect(parseDob('2010-02-30', 'YYYY-MM-DD')).toBeNull();
  });

  it('accepts a real leap day and rejects a fake one', () => {
    expect(parseDob('29/02/2000', 'DD/MM/YYYY')).not.toBeNull();
    expect(parseDob('29/02/2001', 'DD/MM/YYYY')).toBeNull();
  });

  it('rejects years before 1900', () => {
    expect(parseDob('01/01/1899', 'DD/MM/YYYY')).toBeNull();
    expect(parseDob('11/12/0244', 'DD/MM/YYYY')).toBeNull();
  });
});

describe('ageFromDate / ageFromDob', () => {
  it('does not count a birthday that has not happened yet this year', () => {
    freezeNow('2026-08-28T12:00:00');
    // Turns 5 on 2026-12-01, so is still 4 today.
    expect(ageFromDob('01/12/2021', 'DD/MM/YYYY')).toBe(4);
    // Birthday already passed this year.
    expect(ageFromDob('01/01/2021', 'DD/MM/YYYY')).toBe(5);
  });

  it('counts the birthday itself as the new age', () => {
    freezeNow('2026-08-28T12:00:00');
    expect(ageFromDob('28/08/2021', 'DD/MM/YYYY')).toBe(5);
    // One day short.
    expect(ageFromDob('29/08/2021', 'DD/MM/YYYY')).toBe(4);
  });

  // Documents the truncation that makes `isFutureDate` necessary: a date under a
  // year ahead yields 0, so `age < 0` alone cannot detect a future date.
  it('truncates toward zero, so a near-future date yields 0 rather than a negative', () => {
    freezeNow('2026-08-28T12:00:00');
    expect(ageFromDate(new Date(2027, 0, 1))).toBe(0);
    expect(ageFromDate(new Date(2028, 0, 1))).toBe(-1);
  });

  it('isFutureDate detects a future date the age sign would miss', () => {
    freezeNow('2026-08-28T12:00:00');
    expect(isFutureDate(new Date(2027, 0, 1))).toBe(true);
    expect(isFutureDate(new Date(2020, 0, 1))).toBe(false);
  });

  it('returns null for an unparseable value', () => {
    expect(ageFromDob('nonsense')).toBeNull();
  });
});

describe('validateProfileField dateOfBirth (regression)', () => {
  // The previous implementation used `today.getFullYear() - dob.getFullYear()`,
  // which reported this DOB as 5 and let a 4-year-old past the minimum-age gate.
  it('rejects a child who has not yet had their fifth birthday', () => {
    freezeNow('2026-08-28T12:00:00');
    expect(validateProfileField('dateOfBirth', '2021-12-01')).toBe(ProfileValidationMessages.DOB_MIN_AGE);
  });

  it('accepts the same child once their fifth birthday has passed', () => {
    freezeNow('2026-12-02T12:00:00');
    expect(validateProfileField('dateOfBirth', '2021-12-01')).toBeNull();
  });

  it('accepts both input formats the profile surfaces produce', () => {
    freezeNow('2026-08-28T12:00:00');
    expect(validateProfileField('dateOfBirth', '2000-05-05')).toBeNull();
    expect(validateProfileField('dateOfBirth', '05/05/2000')).toBeNull();
  });

  it('rejects a future date of birth', () => {
    freezeNow('2026-08-28T12:00:00');
    expect(validateProfileField('dateOfBirth', '2027-01-01')).toBe(ProfileValidationMessages.DOB_FUTURE);
  });

  it('rejects loose values that the old new Date() parser accepted', () => {
    expect(validateProfileField('dateOfBirth', '2010')).toBe(ProfileValidationMessages.DOB_INVALID);
    expect(validateProfileField('dateOfBirth', 'not-a-date')).toBe(ProfileValidationMessages.DOB_INVALID);
  });

  it('rejects an age over the 100 year maximum', () => {
    freezeNow('2026-08-28T12:00:00');
    expect(validateProfileField('dateOfBirth', '1900-01-01')).toBe(ProfileValidationMessages.DOB_MAX_AGE);
  });

  it('ignores an empty date of birth', () => {
    expect(validateProfileField('dateOfBirth', '')).toBeNull();
  });
});

describe('parentOnboardingPlayerDetailsFormSchema date of birth', () => {
  const base = {
    fullName: 'Junior Player',
    guardianRelation: 'MOTHER' as const,
    email: 'junior@example.com',
  };

  // 31/12/2026 is under a year ahead of the frozen "now", so the age calculation
  // truncates it to 0 — the case a bare `age < 0` guard would have missed.
  it('reports a future date as invalid rather than as below the minimum age', () => {
    freezeNow('2026-08-28T12:00:00');
    const result = parentOnboardingPlayerDetailsFormSchema.safeParse({ ...base, dateOfBirth: '31/12/2026' });
    expect(result.success).toBe(false);
    const message = result.success ? '' : result.error.issues[0].message;
    expect(message).toBe('Please enter a valid Date of Birth.');
  });

  it('accepts a player who is comfortably within the 5-100 range', () => {
    freezeNow('2026-08-28T12:00:00');
    expect(parentOnboardingPlayerDetailsFormSchema.safeParse({ ...base, dateOfBirth: '01/01/2010' }).success).toBe(true);
  });

  it('applies the birthday-boundary fix to the minimum age check', () => {
    freezeNow('2026-08-28T12:00:00');
    expect(parentOnboardingPlayerDetailsFormSchema.safeParse({ ...base, dateOfBirth: '01/12/2021' }).success).toBe(false);
  });
});

describe('createAccountFormSchema date of birth', () => {
  const base = { fullName: 'Adult Parent', email: 'parent@example.com' };

  it('accepts single-digit day/month, matching the other DOB form', () => {
    freezeNow('2026-08-28T12:00:00');
    expect(createAccountFormSchema('parent').safeParse({ ...base, dob: '1/1/2000' }).success).toBe(true);
  });

  it('still rejects a parent under 18', () => {
    freezeNow('2026-08-28T12:00:00');
    expect(createAccountFormSchema('parent').safeParse({ ...base, dob: '01/01/2015' }).success).toBe(false);
  });
});

describe('createPostFormSchema email lists', () => {
  const base = {
    content: 'Goal!',
    audience: CreatePostAudienceEnum.EVERYONE,
    dontShareWithEmails: '',
    locationTag: '',
  };

  // The previous split pattern was /[, \n;]+/ and left the \r on each entry of a
  // CRLF-pasted list, flagging every one of them as an invalid address.
  it('accepts a list pasted with Windows CRLF line endings', () => {
    const result = createPostFormSchema.safeParse({
      ...base,
      shareWithEmails: 'a@example.com\r\nb@example.com\r\nc@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepts tab-separated addresses', () => {
    expect(createPostFormSchema.safeParse({ ...base, shareWithEmails: 'a@example.com\tb@example.com' }).success).toBe(true);
  });

  it('still reports a genuinely invalid address', () => {
    const result = createPostFormSchema.safeParse({ ...base, shareWithEmails: 'a@example.com, not-an-email' });
    expect(result.success).toBe(false);
  });
});
