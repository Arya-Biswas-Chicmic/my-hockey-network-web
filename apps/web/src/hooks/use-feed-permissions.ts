import { useMemo } from 'react';
import { useAuth } from './use-auth';
import {
  evaluateFeedPermissions,
  canCreatePost as checkCanCreatePost,
  canLikePost as checkCanLikePost,
  canComment as checkCanComment,
  canSharePost as checkCanSharePost,
  canRepost as checkCanRepost,
  type FeedPermissionResult,
} from '@my-hockey-network/domain';

export interface UseFeedPermissionsResult {
  permissions: FeedPermissionResult;
  canCreatePost: boolean;
  canLikePost: boolean;
  canComment: boolean;
  canSharePost: boolean;
  canRepost: boolean;
  requirePermission: (onAllowed?: () => void) => boolean;
}

export function useFeedPermissions(onNavigate?: (route: string) => void): UseFeedPermissionsResult {
  const { user, showToast } = useAuth();

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

    const ctaHandler = onNavigate
      ? () => {
          if (permissions.ctaAction === 'COMPLETE_PROFILE') {
            onNavigate('profile');
          } else if (permissions.ctaAction === 'GUARDIAN_APPROVAL') {
            onNavigate('supervision');
          } else if (permissions.ctaAction === 'LOGIN') {
            onNavigate('login');
          }
        }
      : undefined;

    if (permissions.message) {
      showToast(
        permissions.message,
        'error',
        permissions.ctaText || undefined,
        ctaHandler,
      );
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
