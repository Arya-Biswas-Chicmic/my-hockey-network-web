'use client';

import { useEffect, useState } from 'react';
import { repostPost, followUser, unfollowUser } from '@my-hockey-network/core';
import {
  useLikePostMutation,
  useUnlikePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from '@/hooks/use-post-mutations';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import { extractErrorMessage, getApiErrorStatus, showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toast';

export interface UseFeedPostCardParams {
  id: string;
  authorId?: string;
  authorName: string;
  initialContent: string;
  initialLikes: number;
  initialReposts: number;
  initialFollowing: boolean;
  commentsCount: number;
  isSelfRepost: boolean;
  userReaction: string | null;
  requirePermission: (permission?: 'REACT_TO_POSTS' | 'SHARE_POSTS') => boolean;
  onFollowChange?: (authorKey: string, isFollowing: boolean) => void;
  onShareSuccess?: (message: string) => void;
  onRepostComplete?: () => void;
  onDeleteSuccess?: (id: string, message?: string) => void;
  onUpdateSuccess?: (id: string, newContent: string) => void;
}

/**
 * All stateful interaction logic for a single feed post card: like, repost,
 * follow, edit, and delete. Extracted from `FeedPostCard.tsx` — that
 * component now owns only permission gating (`useAuth`) and layout; this
 * hook owns the mutations and the local optimistic-update state each one
 * needs. Behavior is preserved verbatim from the pre-extraction version.
 */
export function useFeedPostCard({
  id,
  authorId,
  authorName,
  initialContent,
  initialLikes,
  initialReposts,
  initialFollowing,
  commentsCount,
  isSelfRepost,
  userReaction,
  requirePermission,
  onFollowChange,
  onShareSuccess,
  onRepostComplete,
  onDeleteSuccess,
  onUpdateSuccess,
}: UseFeedPostCardParams) {
  const likePostMutation = useLikePostMutation();
  const unlikePostMutation = useUnlikePostMutation();
  const updatePostMutation = useUpdatePostMutation();
  const deletePostMutation = useDeletePostMutation();

  const [postContent, setPostContent] = useState(initialContent);
  const [likes, setLikes] = useState(initialLikes);
  const [reposts, setReposts] = useState(initialReposts);
  const [isLiked, setIsLiked] = useState(!!userReaction);
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [hasReposted, setHasReposted] = useState<boolean>(isSelfRepost || false);
  const [userRepostId, setUserRepostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [currentCommentsCount, setCurrentCommentsCount] = useState(commentsCount);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editContentInput, setEditContentInput] = useState(initialContent);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  // Repost "Repost / Quote" choice popover (Figma: figma.com/design/
  // cqlBXHZtqPkKcLRmR6a1B8, node 1766:8766) plus the quote-compose modal
  // it opens into.
  const [isRepostMenuOpen, setIsRepostMenuOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteCommentaryInput, setQuoteCommentaryInput] = useState('');

  // Sync isFollowing state when prop changes from parent
  useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  useEffect(() => {
    setPostContent(initialContent);
    setEditContentInput(initialContent);
  }, [initialContent]);

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    setCurrentCommentsCount(commentsCount);
  }, [commentsCount]);

  useEffect(() => {
    setReposts(initialReposts);
  }, [initialReposts]);

  useEffect(() => {
    setIsLiked(Boolean(userReaction));
  }, [userReaction]);

  const openEditModal = () => {
    setIsMenuOpen(false);
    setEditContentInput(postContent);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = () => {
    setIsMenuOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      await deletePostMutation.mutateAsync({ postId: id });
      setIsDeleteModalOpen(false);
      showSuccessToast(SUCCESS_MESSAGES.POST_DELETED);

      if (onDeleteSuccess) {
        onDeleteSuccess(id, SUCCESS_MESSAGES.POST_DELETED);
      }
      if (onShareSuccess) {
        onShareSuccess(SUCCESS_MESSAGES.POST_DELETED);
      }
      if (onRepostComplete) {
        onRepostComplete();
      }

      // Hide card after triggering callbacks and toast
      setTimeout(() => {
        setIsDeleted(true);
      }, 300);
    } catch (err: unknown) {
      console.error('❌ Delete Post error:', err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_DELETE_POST);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (isUpdating || !editContentInput.trim()) return;
    setIsUpdating(true);

    try {
      await updatePostMutation.mutateAsync({ postId: id, dto: { body: editContentInput.trim() } });
      setPostContent(editContentInput.trim());
      setIsEditModalOpen(false);
      showSuccessToast(SUCCESS_MESSAGES.POST_UPDATED);
      if (onUpdateSuccess) {
        onUpdateSuccess(id, editContentInput.trim());
      }
    } catch (err: unknown) {
      console.error('❌ Update Post error:', err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_UPDATE_POST);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLike = async () => {
    if (!requirePermission('REACT_TO_POSTS')) return;
    if (isLiking) return;
    setIsLiking(true);

    const prevLiked = isLiked;
    const prevLikes = likes;

    // Optimistic UI update
    if (prevLiked) {
      setLikes((prev) => Math.max(0, prev - 1));
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }

    try {
      if (!id || id.includes('unknown') || id.startsWith('post-')) {
        showInfoToast('This post is unavailable for reactions. Refresh the feed and try again.');
        setIsLiked(prevLiked);
        setLikes(prevLikes);
        return;
      }
      if (prevLiked) {
        await unlikePostMutation.mutateAsync({ postId: id });
      } else {
        const res = await likePostMutation.mutateAsync({ postId: id });
        if (res.pendingGuardianApproval || res.message === 'REACTION_PENDING_APPROVAL') {
          showInfoToast('Your reaction has been submitted and is waiting for parent/guardian approval.');
          setIsLiked(prevLiked);
          setLikes(prevLikes);
        }
      }
    } catch (err: unknown) {
      console.error(`❌ [FeedPostCard] Reaction API Error:`, err);
      setIsLiked(prevLiked);
      setLikes(prevLikes);
      const message = extractErrorMessage(err, '');
      if (getApiErrorStatus(err) === 403 && (message.includes('GUARDIAN_DISABLED') || message.includes('guardian'))) {
        showErrorToast(err, ERROR_MESSAGES.GUARDIAN_DISABLED_THIS_ACTION);
      } else {
        showErrorToast(err, 'Unable to update your reaction. Please try again.');
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (!requirePermission('SHARE_POSTS')) return;
    if (isSharing) return;
    setIsSharing(true);

    try {
      if (hasReposted) {
        const targetDeleteId = userRepostId || id;
        await deletePostMutation.mutateAsync({ postId: targetDeleteId });
        setReposts((prev) => Math.max(0, prev - 1));
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
        const res = await repostPost(id);
        const createdRepostId = res.post?.id || res.data?.post?.id || res.data?.id;

        setReposts((prev) => prev + 1);
        setHasReposted(true);
        if (createdRepostId) {
          setUserRepostId(createdRepostId);
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
      console.error(`❌ [FeedPostCard] Repost/Undo Repost API Error:`, err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_REPOST);
    } finally {
      setIsSharing(false);
    }
  };

  // Clicking the repost button: already-reposted undoes directly (no
  // choice needed), otherwise opens the Repost/Quote popover.
  const handleRepostButtonClick = () => {
    if (!requirePermission('SHARE_POSTS')) return;
    if (hasReposted) {
      void handleShare();
      return;
    }
    setIsRepostMenuOpen((prev) => !prev);
  };

  const closeRepostMenu = () => setIsRepostMenuOpen(false);

  const chooseRepost = () => {
    setIsRepostMenuOpen(false);
    void handleShare();
  };

  const chooseQuote = () => {
    setIsRepostMenuOpen(false);
    setQuoteCommentaryInput('');
    setIsQuoteModalOpen(true);
  };

  const closeQuoteModal = () => setIsQuoteModalOpen(false);

  const handleQuoteRepost = async () => {
    if (!requirePermission('SHARE_POSTS')) return;
    if (isSharing || !quoteCommentaryInput.trim()) return;
    setIsSharing(true);

    try {
      const res = await repostPost(id, { commentary: quoteCommentaryInput.trim() });
      const createdRepostId = res.post?.id || res.data?.post?.id || res.data?.id;

      setReposts((prev) => prev + 1);
      setHasReposted(true);
      if (createdRepostId) {
        setUserRepostId(createdRepostId);
      }
      setIsQuoteModalOpen(false);

      const msg = 'Post quoted successfully!';
      if (onShareSuccess) {
        onShareSuccess(msg);
      } else {
        showSuccessToast(msg);
      }
      if (onRepostComplete) {
        onRepostComplete();
      }
    } catch (err: unknown) {
      console.error(`❌ [FeedPostCard] Quote Repost API Error:`, err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_REPOST);
    } finally {
      setIsSharing(false);
    }
  };

  const toggleFollow = async () => {
    if (isFollowingLoading) return;
    setIsFollowingLoading(true);

    const prevFollowing = isFollowing;
    const targetKey = authorId || authorName;

    try {
      if (prevFollowing) {
        const targetIdOrEntity = relationshipId || { type: 'PROFILE' as const, id: targetKey };
        await unfollowUser(targetIdOrEntity);

        // Update state & notify parent to sync other buttons ONLY AFTER API SUCCESS
        setIsFollowing(false);
        setRelationshipId(null);
        if (onFollowChange) {
          onFollowChange(targetKey, false);
        }

        showSuccessToast(`Unfollowed ${authorName}`);
      } else {
        const res = await followUser({ type: 'PROFILE', id: targetKey });

        if (res?.relationship?.id) {
          setRelationshipId(res.relationship.id);
        }
        setIsFollowing(true);
        if (onFollowChange) {
          onFollowChange(targetKey, true);
        }

        showSuccessToast(res?.pendingGuardianApproval ? `Follow requested for ${authorName}` : `You are now following ${authorName}`);
      }
    } catch (err: unknown) {
      console.error(`❌ [FeedPostCard] Follow/Unfollow API Error:`, err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_FOLLOW);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  return {
    // deleted
    isDeleted,
    // content / expand
    postContent,
    isExpanded,
    setIsExpanded,
    // menu
    isMenuOpen,
    setIsMenuOpen,
    // edit
    isEditModalOpen,
    openEditModal,
    closeEditModal: () => setIsEditModalOpen(false),
    editContentInput,
    setEditContentInput,
    isUpdating,
    handleSaveEdit,
    // delete
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal: () => setIsDeleteModalOpen(false),
    isDeleting,
    handleConfirmDelete,
    // like
    isLiked,
    likes,
    isLiking,
    handleLike,
    // repost / share
    reposts,
    hasReposted,
    isSharing,
    handleShare,
    isRepostMenuOpen,
    handleRepostButtonClick,
    closeRepostMenu,
    chooseRepost,
    chooseQuote,
    isQuoteModalOpen,
    closeQuoteModal,
    quoteCommentaryInput,
    setQuoteCommentaryInput,
    handleQuoteRepost,
    // follow
    isFollowing,
    isFollowingLoading,
    toggleFollow,
    // comments
    showComments,
    setShowComments,
    currentCommentsCount,
    setCurrentCommentsCount,
  };
}
