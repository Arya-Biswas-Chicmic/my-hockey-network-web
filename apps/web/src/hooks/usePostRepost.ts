import { useState, useCallback } from 'react';
import { repostPost, deletePost } from '@my-hockey-network/core';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import { useAuth } from '@/hooks/use-auth';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { normalizeApiError } from '@/logic/errors/errorNormalizer';

interface UsePostRepostOptions {
  postId: string;
  initialReposted: boolean;
  initialReposts: number;
  onShareSuccess?: (message: string) => void;
  onRepostComplete?: () => void;
}

export function usePostRepost({
  postId,
  initialReposted,
  initialReposts,
  onShareSuccess,
  onRepostComplete,
}: UsePostRepostOptions) {
  const { assertSupervisionPermission } = useAuth();
  const { requirePermission } = useFeedPermissions();

  const [hasReposted, setHasReposted] = useState<boolean>(initialReposted);
  const [repostsCount, setRepostsCount] = useState<number>(initialReposts);
  const [userRepostId, setUserRepostId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const extractRepostId = (res: unknown): string | null => {
    if (!res || typeof res !== 'object') return null;
    const r = res as Record<string, any>;
    return r?.post?.id || r?.data?.post?.id || r?.data?.id || null;
  };

  const handleShare = useCallback(async () => {
    if (!requirePermission('SHARE_POSTS')) return;
    if (isSharing) return;
    setIsSharing(true);

    try {
      if (hasReposted) {
        const targetDeleteId = userRepostId || postId;
        await deletePost(targetDeleteId);
        setRepostsCount((prev) => Math.max(0, prev - 1));
        setHasReposted(false);
        setUserRepostId(null);

        const msg = 'Repost undone successfully!';
        if (onShareSuccess) {
          onShareSuccess(msg);
        } else {
          showSuccessToast(msg);
        }
        if (onRepostComplete) {
          onRepostComplete();
        }
      } else {
        const res = await repostPost(postId);
        const createdId = extractRepostId(res);

        setRepostsCount((prev) => prev + 1);
        setHasReposted(true);
        if (createdId) {
          setUserRepostId(createdId);
        }

        const msg = 'Post reposted successfully!';
        if (onShareSuccess) {
          onShareSuccess(msg);
        } else {
          showSuccessToast(msg);
        }
        if (onRepostComplete) {
          onRepostComplete();
        }
      }
    } catch (err: unknown) {
      const appErr = normalizeApiError(err, ERROR_MESSAGES.FAILED_REPOST);
      showErrorToast(appErr, ERROR_MESSAGES.FAILED_REPOST);
    } finally {
      setIsSharing(false);
    }
  }, [postId, hasReposted, userRepostId, isSharing, requirePermission, onShareSuccess, onRepostComplete]);

  const triggerShareWithGuard = useCallback(() => {
    assertSupervisionPermission('share_posts', handleShare);
  }, [assertSupervisionPermission, handleShare]);

  return {
    hasReposted,
    repostsCount,
    isSharing,
    handleShare: triggerShareWithGuard,
  };
}
