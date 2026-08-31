import { PermissionControlKey, UserRoleEnum, type AuthMeResponse } from '@my-hockey-network/contracts';

export type FeedPermissionReason =
  | 'UNAUTHENTICATED'
  | 'PROFILE_INCOMPLETE'
  | 'GUARDIAN_APPROVAL_REQUIRED'
  | 'SUPERVISION_CONTROL_RESTRICTED'
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
  if (typeof user.isProfileCompleted === 'boolean') {
    return user.isProfileCompleted;
  }
  if (typeof user.isProfileComplete === 'boolean') {
    return user.isProfileComplete;
  }
  if (typeof user.profile?.isProfileCompleted === 'boolean') {
    return user.profile.isProfileCompleted;
  }
  if (typeof user.profile?.isProfileComplete === 'boolean') {
    return user.profile.isProfileComplete;
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
  return isMinor && (role === UserRoleEnum.PLAYER || role === UserRoleEnum.COACH);
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
 * 4. Supervision control restrictions (when specified)
 * 5. Feed interaction allowed
 */
export function evaluateFeedPermissions(
  user: AuthMeResponse | null,
  controls?: Record<string, boolean | string> | null
): FeedPermissionResult {
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

  if (controls && controls[PermissionControlKey.VIEW_FEED] === false) {
    return {
      allowed: false,
      reason: 'SUPERVISION_CONTROL_RESTRICTED',
      message: 'Your parent/guardian has disabled viewing feed posts.',
      ctaText: null,
      ctaAction: null,
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

/**
 * Whether the user may see feed posts at all.
 *
 * `evaluateFeedPermissions` already returns `allowed: false` for a disabled
 * `VIEW_FEED` control, but nothing consumed that as a render gate — the Home
 * screen showed the pending banner *above* a fully populated feed, so a
 * supervised child whose guardian had turned viewing off could still read every
 * post. This is the predicate the feed itself checks.
 */
export function canViewFeed(
  user: AuthMeResponse | null,
  controls?: Record<string, boolean | string> | null
): boolean {
  return evaluateFeedPermissions(user, controls).allowed;
}

export function canCreatePost(
  user: AuthMeResponse | null,
  controls?: Record<string, boolean | string> | null
): boolean {
  if (!evaluateFeedPermissions(user, controls).allowed) return false;
  if (controls && controls[PermissionControlKey.CREATE_POST] === false) return false;
  return true;
}

export function canLikePost(
  user: AuthMeResponse | null,
  controls?: Record<string, boolean | string> | null
): boolean {
  if (!evaluateFeedPermissions(user, controls).allowed) return false;
  if (controls && controls.REACT_TO_POSTS === false) return false;
  return true;
}

export function canComment(
  user: AuthMeResponse | null,
  controls?: Record<string, boolean | string> | null
): boolean {
  if (!evaluateFeedPermissions(user, controls).allowed) return false;
  if (controls && controls.COMMENT_ON_POSTS === false) return false;
  return true;
}

export function canSharePost(
  user: AuthMeResponse | null,
  controls?: Record<string, boolean | string> | null
): boolean {
  if (!evaluateFeedPermissions(user, controls).allowed) return false;
  if (controls && controls.SHARE_POSTS === false) return false;
  return true;
}

export function canRepost(
  user: AuthMeResponse | null,
  controls?: Record<string, boolean | string> | null
): boolean {
  if (!evaluateFeedPermissions(user, controls).allowed) return false;
  if (controls && controls.SHARE_POSTS === false) return false;
  return true;
}

export function canFollowOthers(
  user: AuthMeResponse | null,
  controls?: Record<string, boolean | string> | null
): boolean {
  if (!evaluateFeedPermissions(user, controls).allowed) return false;
  if (controls && controls[PermissionControlKey.FOLLOW_OTHERS] === false) return false;
  return true;
}

export function canSendMessages(
  user: AuthMeResponse | null,
  controls?: Record<string, boolean | string> | null
): boolean {
  if (!evaluateFeedPermissions(user, controls).allowed) return false;
  if (controls && controls[PermissionControlKey.SEND_MESSAGES] === false) return false;
  return true;
}

export function canCreateGroupChats(
  user: AuthMeResponse | null,
  controls?: Record<string, boolean | string> | null
): boolean {
  if (!evaluateFeedPermissions(user, controls).allowed) return false;
  if (controls && controls[PermissionControlKey.CREATE_GROUP_CHATS] === false) return false;
  return true;
}

/**
 * The user-facing reason a supervised child cannot perform a given action.
 *
 * Kept beside the permission predicates rather than in each component so the
 * blocked-action wording has one owner. Previously five components hardcoded
 * "Parent did not give permission" in a `title` attribute, the auth context
 * toasted "Your parent did not give permission for this feature.", and
 * `useFeedPermissions` toasted `PARENT_DISABLED_FEATURE` — three different
 * sentences for the same state.
 */
export const SUPERVISION_BLOCKED_MESSAGES: Partial<Record<PermissionControlKey, string>> = {
  [PermissionControlKey.VIEW_FEED]: 'Your parent hasn’t enabled viewing the feed yet.',
  [PermissionControlKey.CREATE_POST]: 'Your parent hasn’t enabled posting yet.',
  [PermissionControlKey.COMMENT_ON_POSTS]: 'Your parent hasn’t enabled commenting yet.',
  [PermissionControlKey.REACT_TO_POSTS]: 'Your parent hasn’t enabled reactions yet.',
  [PermissionControlKey.SHARE_POSTS]: 'Your parent hasn’t enabled sharing yet.',
  [PermissionControlKey.FOLLOW_OTHERS]: 'Your parent hasn’t enabled following others yet.',
  [PermissionControlKey.SEND_MESSAGES]: 'Your parent hasn’t enabled messaging yet.',
  [PermissionControlKey.CREATE_GROUP_CHATS]: 'Your parent hasn’t enabled group chats yet.',
};

/** Fallback for a control with no specific copy. */
export const SUPERVISION_BLOCKED_FALLBACK = 'Your parent/guardian has disabled this feature.';

/** The message to show when `control` is blocked for a supervised child. */
export function supervisionBlockedMessage(control: PermissionControlKey | string): string {
  return (
    SUPERVISION_BLOCKED_MESSAGES[control as PermissionControlKey] ??
    SUPERVISION_BLOCKED_FALLBACK
  );
}
