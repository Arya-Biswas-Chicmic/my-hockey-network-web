import { describe, expect, it } from 'vitest';
import type { AuthMeResponse } from '@my-hockey-network/contracts';
import { getPrimaryRole, hasAnyRole } from '../index';

const user = (primaryRole: string, profileType = 'PLAYER') =>
  ({ primaryRole, profile: { type: profileType } } as AuthMeResponse);

describe('role domain rules', () => {
  it('uses primary role before profile type', () => {
    expect(getPrimaryRole(user('PARENT', 'PLAYER'))).toBe('PARENT');
  });

  it('falls back to profile type and supports case-insensitive authorization', () => {
    const profileOnly = { profile: { type: 'coach' } } as AuthMeResponse;
    expect(getPrimaryRole(profileOnly)).toBe('coach');
    expect(hasAnyRole(profileOnly, ['COACH'])).toBe(true);
  });

  it('denies missing users, missing roles, and non-matching roles', () => {
    expect(getPrimaryRole(null)).toBeNull();
    expect(hasAnyRole(null, ['PARENT'])).toBe(false);
    expect(hasAnyRole({} as AuthMeResponse, ['PARENT'])).toBe(false);
    expect(hasAnyRole(user('PLAYER'), ['PARENT', 'COACH'])).toBe(false);
  });
});
