import { describe, it, expect } from 'vitest';
import {
  evaluateFeedPermissions,
  canCreatePost,
  canLikePost,
  canComment,
  canSharePost,
  canRepost,
} from '../permissions/feedPermissions';
import type { AuthMeResponse } from '@my-hockey-network/contracts';

function makeUser(overrides: Partial<AuthMeResponse> = {}): AuthMeResponse {
  return {
    id: 'user_1',
    phone: null,
    email: 'user@test.com',
    status: 'ACTIVE',
    primaryRole: 'PARENT',
    roleAssignments: [],
    onboardingCompletedAt: '2026-01-01',
    lastLoginAt: '2026-08-24',
    createdAt: '2026-01-01',
    isProfileComplete: true,
    guardianship: {
      required: false,
      approved: true,
    },
    profile: {
      id: 'prof_1',
      type: 'PARENT',
      displayName: 'Test User',
      avatarUrl: null,
      isMinor: false,
      accessLevel: 'FULL',
      verificationStatus: 'VERIFIED',
    },
    ...overrides,
  };
}

describe('Centralized Feed Permissions Matrix', () => {
  it('blocks unauthenticated users', () => {
    const res = evaluateFeedPermissions(null);
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe('UNAUTHENTICATED');
    expect(res.ctaAction).toBe('LOGIN');
    expect(canCreatePost(null)).toBe(false);
  });

  // Matrix Row 1: PARENT, profile false, guardian false, approved false -> Profile completion required
  it('PARENT with incomplete profile is blocked with PROFILE_INCOMPLETE', () => {
    const user = makeUser({
      primaryRole: 'PARENT',
      isProfileComplete: false,
      guardianship: { required: false, approved: false },
    });
    const res = evaluateFeedPermissions(user);
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe('PROFILE_INCOMPLETE');
    expect(res.message).toBe('Please complete your profile before you can interact with the community.');
    expect(res.ctaText).toBe('Complete Profile');
    expect(res.ctaAction).toBe('COMPLETE_PROFILE');
    expect(canLikePost(user)).toBe(false);
  });

  // Matrix Row 2: PARENT, profile true, guardian false, approved false -> Feed allowed
  it('PARENT with complete profile is allowed even if guardian approved is false', () => {
    const user = makeUser({
      primaryRole: 'PARENT',
      isProfileComplete: true,
      guardianship: { required: false, approved: false },
    });
    const res = evaluateFeedPermissions(user);
    expect(res.allowed).toBe(true);
    expect(res.reason).toBe('ALLOWED');
    expect(canComment(user)).toBe(true);
  });

  // Matrix Row 3: PLAYER, profile false, guardian true, approved false -> Profile completion required (priority 2 over 3)
  it('PLAYER with incomplete profile & required guardian is blocked with PROFILE_INCOMPLETE first', () => {
    const user = makeUser({
      primaryRole: 'PLAYER',
      isProfileComplete: false,
      guardianship: { required: true, approved: false },
    });
    const res = evaluateFeedPermissions(user);
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe('PROFILE_INCOMPLETE');
    expect(res.ctaAction).toBe('COMPLETE_PROFILE');
    expect(canSharePost(user)).toBe(false);
  });

  // Matrix Row 4: PLAYER, profile true, guardian true, approved false -> Guardian approval required
  it('PLAYER with complete profile & unapproved guardian is blocked with GUARDIAN_APPROVAL_REQUIRED', () => {
    const user = makeUser({
      primaryRole: 'PLAYER',
      isProfileComplete: true,
      guardianship: { required: true, approved: false },
    });
    const res = evaluateFeedPermissions(user);
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe('GUARDIAN_APPROVAL_REQUIRED');
    expect(res.message).toBe('Your account is waiting for guardian approval.');
    expect(res.ctaText).toBe('Check Approval');
    expect(res.ctaAction).toBe('GUARDIAN_APPROVAL');
    expect(canRepost(user)).toBe(false);
  });

  // Matrix Row 5: PLAYER, profile true, guardian true, approved true -> Feed allowed
  it('PLAYER with complete profile & approved guardian is ALLOWED', () => {
    const user = makeUser({
      primaryRole: 'PLAYER',
      isProfileComplete: true,
      guardianship: { required: true, approved: true },
    });
    const res = evaluateFeedPermissions(user);
    expect(res.allowed).toBe(true);
    expect(res.reason).toBe('ALLOWED');
    expect(canCreatePost(user)).toBe(true);
  });

  // Matrix Row 6: COACH, profile false, guardian depends, approved depends -> Profile completion required
  it('COACH with incomplete profile is blocked with PROFILE_INCOMPLETE', () => {
    const user = makeUser({
      primaryRole: 'COACH',
      isProfileComplete: false,
      guardianship: { required: true, approved: false },
    });
    const res = evaluateFeedPermissions(user);
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe('PROFILE_INCOMPLETE');
    expect(canLikePost(user)).toBe(false);
  });

  // Matrix Row 7: COACH, profile true, guardian true, approved false -> Guardian approval required
  it('COACH with complete profile & unapproved guardian is blocked with GUARDIAN_APPROVAL_REQUIRED', () => {
    const user = makeUser({
      primaryRole: 'COACH',
      isProfileComplete: true,
      guardianship: { required: true, approved: false },
    });
    const res = evaluateFeedPermissions(user);
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe('GUARDIAN_APPROVAL_REQUIRED');
    expect(canComment(user)).toBe(false);
  });

  // Matrix Row 8: COACH, profile true, guardian true, approved true -> Feed allowed
  it('COACH with complete profile & approved guardian is ALLOWED', () => {
    const user = makeUser({
      primaryRole: 'COACH',
      isProfileComplete: true,
      guardianship: { required: true, approved: true },
    });
    const res = evaluateFeedPermissions(user);
    expect(res.allowed).toBe(true);
    expect(res.reason).toBe('ALLOWED');
    expect(canCreatePost(user)).toBe(true);
  });
});
