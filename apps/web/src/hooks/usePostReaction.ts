import { useState, useCallback } from 'react';
import { likePost, unlikePost } from '@my-hockey-network/core';
import { REACTION_TYPE, REACTION_RESULT, ReactionResultEnum } from '@my-hockey-network/contracts';
import { ERROR_MESSAGES } from '@my-hockey-network/constants';
import { useAuth } from '@/hooks/use-auth';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toast';
import { normalizeApiError } from '@/logic/errors/errorNormalizer';

interface UsePostReactionOptions {
  postId: string;
  initialLiked: boolean;
  initialLikes: number;
}

export function usePostReaction({ postId, initialLiked, initialLikes }: UsePostReactionOptions) {
  const { assertSupervisionPermission } = useAuth();
  const { requirePermission } = useFeedPermissions();

  const [isLiked, setIsLiked] = useState<boolean>(initialLiked);
  const [likesCount, setLikesCount] = useState<number>(initialLikes);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  const handleLike = useCallback(async () => {
    if (!requirePermission('REACT_TO_POSTS')) return;
    if (isLiking) return;

    setIsLiking(true);

    const prevLiked = isLiked;
    const prevLikes = likesCount;

    // Optimistic reaction update
    if (prevLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }

    try {
      if (prevLiked) {
        await unlikePost(postId);
      } else {
        const res = await likePost(postId, REACTION_TYPE.LIKE);
        const resObj = res as Record<string, unknown>;
        if (resObj?.pendingGuardianApproval || resObj?.message === ReactionResultEnum.PENDING_APPROVAL) {
          showInfoToast('Your reaction has been submitted and is waiting for parent/guardian approval.');
          setIsLiked(prevLiked);
          setLikesCount(prevLikes);
        }
      }
    } catch (err: unknown) {
      setIsLiked(prevLiked);
      setLikesCount(prevLikes);
      const appErr = normalizeApiError(err, ERROR_MESSAGES.GUARDIAN_DISABLED_THIS_ACTION);
      if (appErr.statusCode === 403) {
        showErrorToast(appErr, ERROR_MESSAGES.GUARDIAN_DISABLED_THIS_ACTION);
      } else {
        showErrorToast(appErr, ERROR_MESSAGES.DEFAULT_UNEXPECTED);
      }
    } finally {
      setIsLiking(false);
    }
  }, [postId, isLiked, likesCount, isLiking, requirePermission]);

  const triggerLikeWithGuard = useCallback(() => {
    assertSupervisionPermission('react_to_posts', handleLike);
  }, [assertSupervisionPermission, handleLike]);

  return {
    isLiked,
    likesCount,
    isLiking,
    handleLike: triggerLikeWithGuard,
  };
}
