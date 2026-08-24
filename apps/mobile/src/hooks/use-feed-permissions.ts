import { useMemo } from 'react';
import {
  evaluateFeedPermissions,
  canCreatePost as checkCanCreatePost,
  canLikePost as checkCanLikePost,
  canComment as checkCanComment,
  canSharePost as checkCanSharePost,
  canRepost as checkCanRepost,
  type FeedPermissionResult,
} from '@my-hockey-network/domain';
import type { AuthMeResponse } from '@my-hockey-network/contracts';

export interface UseMobileFeedPermissionsResult {
  permissions: FeedPermissionResult;
  canCreatePost: boolean;
  canLikePost: boolean;
  canComment: boolean;
  canSharePost: boolean;
  canRepost: boolean;
  requirePermission: (onAllowed?: () => void) => boolean;
}

export function useFeedPermissions(
  user: AuthMeResponse | null,
  onNotifyRestriction?: (msg: string, ctaAction: string | null) => void,
): UseMobileFeedPermissionsResult {
  const permissions = useMemo(() => evaluateFeedPermissions(user), [user]);

  const canCreatePost = useMemo(() => checkCanCreatePost(user), [user]);
  const canLikePost = useMemo(() => checkCanLikePost(user), [user]);
  const canComment = useMemo(() => checkCanComment(user), [user]);
  const canSharePost = useMemo(() => checkCanSharePost(user), [user]);
  const canRepost = useMemo(() => checkCanRepost(user), [user]);

  const requirePermission = (onAllowed?: () => void): boolean => {
    if (permissions.allowed) {
      if (onAllowed) onAllowed();
      return true;
    }

    if (onNotifyRestriction && permissions.message) {
      onNotifyRestriction(permissions.message, permissions.ctaAction);
    }

    return false;
  };

  return {
    permissions,
    canCreatePost,
    canLikePost,
    canComment,
    canSharePost,
    canRepost,
    requirePermission,
  };
}
