import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getMySupervisionPermissions } from '@my-hockey-network/core';
import {
  evaluateFeedPermissions,
  canViewFeed as checkCanViewFeed,
  canCreatePost as checkCanCreatePost,
  canLikePost as checkCanLikePost,
  canComment as checkCanComment,
  canSharePost as checkCanSharePost,
  canRepost as checkCanRepost,
  canFollowOthers as checkCanFollowOthers,
  canSendMessages as checkCanSendMessages,
  canCreateGroupChats as checkCanCreateGroupChats,
  supervisionBlockedMessage,
  type FeedCtaAction,
  type FeedPermissionResult,
} from '@my-hockey-network/domain';

/**
 * Maps a permission CTA to its destination. Shared by the toast handler below
 * and `common/FeedPermissionBanner`, so the banner and the toast can never send
 * a user to different places for the same reason — they were previously two
 * separate copies of this if/else chain.
 */
export function resolveFeedPermissionCta(
  ctaAction: FeedCtaAction,
  onNavigate?: (screen: string) => void,
): void {
  if (!onNavigate) return;

  if (ctaAction === 'COMPLETE_PROFILE') {
    onNavigate('profile');
  } else if (ctaAction === 'GUARDIAN_APPROVAL') {
    onNavigate('supervision');
  } else if (ctaAction === 'LOGIN') {
    onNavigate('login');
  }
}

export interface UseFeedPermissionsResult {
  permissions: FeedPermissionResult;
  supervisionControls: Record<string, boolean | string> | null;
  canViewFeed: boolean;
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
  const { user, supervisionPermissions, showToast } = useAuth();

  const supervisionControls = (supervisionPermissions as Record<string, boolean | string> | null) ?? null;

  const permissions = useMemo(() => evaluateFeedPermissions(user, supervisionControls), [user, supervisionControls]);

  const canViewFeed = useMemo(() => checkCanViewFeed(user, supervisionControls), [user, supervisionControls]);
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
        ? () => resolveFeedPermissionCta(permissions.ctaAction, onNavigate)
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
      // Same copy the gate and the auth context use, so a blocked action reads
      // identically however the user happened to trigger it.
      showToast(supervisionBlockedMessage(actionKey), 'error');
      return false;
    }

    if (onAllowed) onAllowed();
    return true;
  };


  return {
    permissions,
    supervisionControls,
    canViewFeed,
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
