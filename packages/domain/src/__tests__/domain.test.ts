import { describe, expect, it } from 'vitest';
import type { AuthMeResponse } from '@my-hockey-network/contracts';
import { getPrimaryRole, hasAnyRole, isMinorPlayerUser, isParentUser } from '../index';

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

  it('recognizes roles granted through role assignments', () => {
    const assignedParent = {
      primaryRole: 'PLAYER',
      roleAssignments: [{ role: 'PARENT' }],
      profile: { type: 'PLAYER', isMinor: false },
    } as AuthMeResponse;

    expect(hasAnyRole(assignedParent, ['PARENT'])).toBe(true);
    expect(isParentUser(assignedParent)).toBe(true);
  });

  it('requires both the minor flag and player role for minor-player access', () => {
    const minorPlayer = {
      primaryRole: 'PLAYER',
      roleAssignments: [],
      profile: { type: 'PLAYER', isMinor: true },
    } as AuthMeResponse;
    const adultPlayer = {
      ...minorPlayer,
      profile: { ...minorPlayer.profile, isMinor: false },
    } as AuthMeResponse;
    const minorCoach = {
      ...minorPlayer,
      primaryRole: 'COACH',
      profile: { ...minorPlayer.profile, type: 'COACH' },
    } as AuthMeResponse;

    expect(isMinorPlayerUser(minorPlayer)).toBe(true);
    expect(isMinorPlayerUser(adultPlayer)).toBe(false);
    expect(isMinorPlayerUser(minorCoach)).toBe(false);
    expect(isMinorPlayerUser(null)).toBe(false);
  });
});
