import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './use-auth';
import { getMySupervisionPermissions } from '@my-hockey-network/core';
import {
  evaluateFeedPermissions,
  canCreatePost as checkCanCreatePost,
  canLikePost as checkCanLikePost,
  canComment as checkCanComment,
  canSharePost as checkCanSharePost,
  canRepost as checkCanRepost,
  canFollowOthers as checkCanFollowOthers,
  canSendMessages as checkCanSendMessages,
  canCreateGroupChats as checkCanCreateGroupChats,
  type FeedPermissionResult,
} from '@my-hockey-network/domain';

export interface UseFeedPermissionsResult {
  permissions: FeedPermissionResult;
  supervisionControls: Record<string, boolean | string> | null;
  canCreatePost: boolean;
  canLikePost: boolean;
  canComment: boolean;
  canSharePost: boolean;
  canRepost: boolean;
  canFollowOthers: boolean;
  canSendMessages: boolean;
  canCreateGroupChats: boolean;
  requirePermission: (
    actionKey?: 'CREATE_POST' | 'REACT_TO_POSTS' | 'COMMENT_ON_POSTS' | 'SHARE_POSTS' | 'FOLLOW_OTHERS' | 'SEND_MESSAGES' | 'CREATE_GROUP_CHATS',
    onAllowed?: () => void
  ) => boolean;
}

export function useFeedPermissions(onNavigate?: (route: string) => void): UseFeedPermissionsResult {
  const { user, showToast } = useAuth();
  const [supervisionControls, setSupervisionControls] = useState<Record<string, boolean | string> | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPermissions() {
      if (!user) {
        if (isMounted) setSupervisionControls(null);
        return;
      }
      try {
        const res = await getMySupervisionPermissions();
        if (isMounted && res?.controlsMap) {
          setSupervisionControls(res.controlsMap);
        }
      } catch (err) {
        // Safe fallback for non-minor users or network errors
        if (isMounted) setSupervisionControls(null);
      }
    }
    loadPermissions();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const permissions = useMemo(() => evaluateFeedPermissions(user, supervisionControls), [user, supervisionControls]);

  const canCreatePost = useMemo(() => checkCanCreatePost(user, supervisionControls), [user, supervisionControls]);
  const canLikePost = useMemo(() => checkCanLikePost(user, supervisionControls), [user, supervisionControls]);
  const canComment = useMemo(() => checkCanComment(user, supervisionControls), [user, supervisionControls]);
  const canSharePost = useMemo(() => checkCanSharePost(user, supervisionControls), [user, supervisionControls]);
  const canRepost = useMemo(() => checkCanRepost(user, supervisionControls), [user, supervisionControls]);
  const canFollowOthers = useMemo(() => checkCanFollowOthers(user, supervisionControls), [user, supervisionControls]);
  const canSendMessages = useMemo(() => checkCanSendMessages(user, supervisionControls), [user, supervisionControls]);
  const canCreateGroupChats = useMemo(() => checkCanCreateGroupChats(user, supervisionControls), [user, supervisionControls]);

  const requirePermission = (
    actionKey?: 'CREATE_POST' | 'REACT_TO_POSTS' | 'COMMENT_ON_POSTS' | 'SHARE_POSTS' | 'FOLLOW_OTHERS' | 'SEND_MESSAGES' | 'CREATE_GROUP_CHATS',
    onAllowed?: () => void
  ): boolean => {
    if (!permissions.allowed) {
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
    }

    if (actionKey && supervisionControls && supervisionControls[actionKey] === false) {
      showToast('Your parent/guardian has disabled this feature.', 'error');
      return false;
    }

    if (onAllowed) onAllowed();
    return true;
  };

  return {
    permissions,
    supervisionControls,
    canCreatePost,
    canLikePost,
    canComment,
    canSharePost,
    canRepost,
    canFollowOthers,
    canSendMessages,
    canCreateGroupChats,
    requirePermission,
  };
}
