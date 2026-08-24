import type { AuthMeResponse } from '@my-hockey-network/contracts';

export type FeedPermissionReason =
  | 'UNAUTHENTICATED'
  | 'PROFILE_INCOMPLETE'
  | 'GUARDIAN_APPROVAL_REQUIRED'
  | 'ALLOWED';

export type FeedCtaAction =
  | 'LOGIN'
  | 'COMPLETE_PROFILE'
  | 'GUARDIAN_APPROVAL'
  | null;

export interface FeedPermissionResult {
  allowed: boolean;
  reason: FeedPermissionReason;
  message: string | null;
  ctaText: string | null;
  ctaAction: FeedCtaAction;
}

/**
 * Determines whether a user's profile is complete.
 * Respects explicit isProfileComplete boolean from /v1/auth/me or checks essential profile attributes.
 */
export function isProfileComplete(user: AuthMeResponse | null): boolean {
  if (!user) return false;
  if (typeof user.isProfileComplete === 'boolean') {
    return user.isProfileComplete;
  }
  // Fallback profile inspection
  const profile = user.profile;
  if (!profile) return false;
  return Boolean(profile.displayName && profile.id);
}

/**
 * Checks whether the user's account requires guardian approval.
 * Evaluates backend guardianship.required property or minor status for PLAYER/COACH roles.
 */
export function requiresGuardianApproval(user: AuthMeResponse | null): boolean {
  if (!user) return false;
  if (user.guardianship && typeof user.guardianship.required === 'boolean') {
    return user.guardianship.required;
  }
  // Role/minor fallback: minors with PLAYER or COACH roles require guardian approval
  const role = (user.primaryRole || user.profile?.type || '').toUpperCase();
  const isMinor = user.profile?.isMinor ?? false;
  return isMinor && (role === 'PLAYER' || role === 'COACH');
}

/**
 * Checks whether guardian approval has been granted.
 */
export function isGuardianApproved(user: AuthMeResponse | null): boolean {
  if (!user) return false;
  if (!requiresGuardianApproval(user)) return true;
  if (user.guardianship && typeof user.guardianship.approved === 'boolean') {
    return user.guardianship.approved;
  }
  // Fallback: SUPERVISED or FULL access level grants approval
  const accessLevel = user.profile?.accessLevel;
  return accessLevel === 'SUPERVISED' || accessLevel === 'FULL';
}

/**
 * Centralized Permission Evaluator following the priority hierarchy:
 * 1. Authentication
 * 2. Profile completion
 * 3. Guardian approval (when required)
 * 4. Feed interaction allowed
 */
export function evaluateFeedPermissions(user: AuthMeResponse | null): FeedPermissionResult {
  if (!user) {
    return {
      allowed: false,
      reason: 'UNAUTHENTICATED',
      message: 'Please sign in to interact with posts.',
      ctaText: 'Sign In',
      ctaAction: 'LOGIN',
    };
  }

  if (!isProfileComplete(user)) {
    return {
      allowed: false,
      reason: 'PROFILE_INCOMPLETE',
      message: 'Please complete your profile before you can interact with the community.',
      ctaText: 'Complete Profile',
      ctaAction: 'COMPLETE_PROFILE',
    };
  }

  if (requiresGuardianApproval(user) && !isGuardianApproved(user)) {
    return {
      allowed: false,
      reason: 'GUARDIAN_APPROVAL_REQUIRED',
      message: 'Your account is waiting for guardian approval.',
      ctaText: 'Check Approval',
      ctaAction: 'GUARDIAN_APPROVAL',
    };
  }

  return {
    allowed: true,
    reason: 'ALLOWED',
    message: null,
    ctaText: null,
    ctaAction: null,
  };
}

export function canCreatePost(user: AuthMeResponse | null): boolean {
  return evaluateFeedPermissions(user).allowed;
}

export function canLikePost(user: AuthMeResponse | null): boolean {
  return evaluateFeedPermissions(user).allowed;
}

export function canComment(user: AuthMeResponse | null): boolean {
  return evaluateFeedPermissions(user).allowed;
}

export function canSharePost(user: AuthMeResponse | null): boolean {
  return evaluateFeedPermissions(user).allowed;
}

export function canRepost(user: AuthMeResponse | null): boolean {
  return evaluateFeedPermissions(user).allowed;
}
