import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/FormControls';
import React, { useState, useEffect } from 'react';
import { repostPost, followUser, unfollowUser } from '@my-hockey-network/core';
import { Spinner } from '@/components/common/Spinner';

import { useAuth } from '@/hooks/use-auth';
import {
  useLikePostMutation,
  useUnlikePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from '@/hooks/use-post-mutations';
import { PostCommentSection } from '@/components/features/home/PostCommentSection';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { extractErrorMessage, getApiErrorStatus, showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import { LockKeyhole, MoreHorizontal, Pencil, ThumbsUp, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { FallbackImage } from '@/components/ui/fallback-image';


export interface FeedPostProps {
  id: string;
  authorId?: string;
  authorName: string;
  authorRole?: string;
  authorTime?: string;
  authorAvatar?: string;
  content: string;
  postImage?: string;
  likesCount: number;
  commentsCount: number;
  repostCount?: number;
  isFollowing?: boolean;
  isSelf?: boolean;
  userReaction?: string | null;

  // Repost specific properties
  isRepost?: boolean;
  repostedByName?: string;
  isSelfRepost?: boolean;
  hasThirdPartyReposts?: boolean;
  repostCommentary?: string;
  originalPost?: {
    id: string;
    authorName: string;
    authorRole?: string;
    authorAvatar?: string;
    authorTime?: string;
    content: string;
    postImage?: string;
  };

  onFollowChange?: (authorKey: string, isFollowing: boolean) => void;
  onShareSuccess?: (message: string) => void;
  onRepostComplete?: () => void;
  onDeleteSuccess?: (id: string, message?: string) => void;
  onUpdateSuccess?: (id: string, newContent: string) => void;
  onNavigate?: (screen: string) => void;
}

export const FeedPostCard: React.FC<FeedPostProps> = ({
  id,
  authorId,
  authorName,
  authorRole = 'Official Team',
  authorTime = '1d',
  authorAvatar = '/CoachTeam.png',
  content: initialContent,
  postImage,
  likesCount: initialLikes,
  commentsCount,
  repostCount: initialReposts = 0,
  isFollowing: initialFollowing = false,
  isSelf = false,
  isSelfRepost = false,
  userReaction = null,
  onFollowChange,
  onShareSuccess,
  onRepostComplete,
  onDeleteSuccess,
  onUpdateSuccess,
  onNavigate,
}) => {
  const { checkSupervisionPermission, assertSupervisionPermission } = useAuth();
  const canReact = checkSupervisionPermission('react_to_posts');
  const canComment = checkSupervisionPermission('comment_on_posts');
  const canShare = checkSupervisionPermission('share_posts');
  const canFollow = checkSupervisionPermission('follow_others');

  const likePostMutation = useLikePostMutation();
  const unlikePostMutation = useUnlikePostMutation();
  const updatePostMutation = useUpdatePostMutation();
  const deletePostMutation = useDeletePostMutation();

  const { requirePermission } = useFeedPermissions(onNavigate);
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

  // Menu & Edit/Delete States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editContentInput, setEditContentInput] = useState(initialContent);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);

  if (isDeleted) {
    return null;
  }

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
        showInfoToast('Cannot react to mock or fallback feed posts.');
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

  return (
    <article className="mhn-feed-post-card">
      <div className="mhn-post-header">
        <div className="mhn-post-author-group">
          <div className="mhn-author-avatar-box">
            <FallbackImage
              src={authorAvatar}
              alt={authorName}
              fill
              className="mhn-author-avatar-img"
            />
          </div>
          <div className="mhn-author-meta">
            <h4 className="mhn-author-name">{authorName}</h4>
            <span className="mhn-author-subtitle">
              {authorRole} • {authorTime}
            </span>
          </div>
        </div>

        <div className="mhn-post-header-actions mhn-relative-container">
          {!isSelf && (
            <Button
              onClick={() => assertSupervisionPermission('follow_others', toggleFollow)}
              disabled={isFollowingLoading}
              className={`mhn-btn-follow ${isFollowing ? 'mhn-btn-following' : ''} ${isFollowingLoading ? 'mhn-loading' : ''}`}
              title={!canFollow ? 'Parent did not give permission' : undefined}
            >
              {!canFollow ? (
                <>
                  <LockKeyhole size={14} aria-hidden="true" />
                  Follow
                </>
              ) : isFollowingLoading ? (
                <Spinner size="sm" color={isFollowing ? '#475569' : '#FFFFFF'} />
              ) : isFollowing ? (
                'Following'
              ) : (
                'Follow'
              )}
            </Button>
          )}

          {isSelf && (
            <>
              <Button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="mhn-btn-more-options"
                aria-label="More options"
              >
                <MoreHorizontal size={20} aria-hidden="true" />
              </Button>

              {isMenuOpen && (
                <div className="mhn-post-menu-popover">
                  <Button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setEditContentInput(postContent);
                      setIsEditModalOpen(true);
                    }}
                    className="mhn-post-menu-item"
                  >
                    <Pencil size={14} aria-hidden="true" />
                    <span>Edit Post</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDeleteModalOpen(true);
                    }}
                    className="mhn-post-menu-item-danger"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    <span>Delete Post</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mhn-post-content">
        <p className={`mhn-post-text ${!isExpanded ? 'mhn-post-text-truncated' : ''}`}>
          {postContent}
        </p>
        {postContent.length > 30 && (
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mhn-post-more-btn"
          >
            {isExpanded ? 'Show less' : 'More'}
          </Button>
        )}
        {postImage && (
          <div className="mhn-post-media-container">
            <FallbackImage
              src={postImage}
              alt="Post attachment"
              width={800}
              height={450}
              hideOnError
              className="mhn-post-media-img"
            />
          </div>
        )}
      </div>

      <div className="mhn-post-footer">
        <div className="mhn-post-actions-group">
          <Button
            onClick={() => assertSupervisionPermission('react_to_posts', handleLike)}
            disabled={isLiking}
            className={`mhn-action-item ${isLiked ? 'mhn-action-liked' : ''}`}
            aria-label="Like post"
            title={!canReact ? 'Parent did not give permission' : undefined}
          >
            {!canReact ? (
              <LockKeyhole size={18} className="like-count-icon" aria-hidden="true" />
            ) : isLiked ? (
              <ThumbsUp size={20} fill="#1860C3" className="like-count-icon" aria-hidden="true" />
            ) : (
              <Image src="/like.png" alt="" width={15} height={15} className="like-count-icon" />
            )}
            <span className={`mhn-action-count ${isLiked ? 'mhn-action-count-liked' : ''}`}>{likes}</span>
          </Button>

          <Button
            onClick={() => assertSupervisionPermission('comment_on_posts', () => {
              if (requirePermission()) {
                setShowComments((prev) => !prev);
              }
            })}
            className={`mhn-action-item ${showComments ? 'mhn-action-active' : ''}`}
            aria-label="Toggle comments"
            title={!canComment ? 'Parent did not give permission' : undefined}
          >
            {!canComment ? (
              <LockKeyhole size={18} className="comment-count-icon" aria-hidden="true" />
            ) : (
              <Image src="/comment.png" alt="" width={15} height={14} className="comment-count-icon" />
            )}
            <span className={`mhn-action-count ${showComments ? 'mhn-action-count-commented' : ''}`}>
              {currentCommentsCount}
            </span>
          </Button>

          {!isSelf && (
            <Button
              onClick={() => assertSupervisionPermission('share_posts', handleShare)}
              disabled={isSharing}
              className={`mhn-action-item ${hasReposted ? 'mhn-action-active' : ''} ${isSharing ? 'mhn-loading' : ''}`}
              aria-label="Share post"
              title={!canShare ? 'Parent did not give permission' : hasReposted ? 'Undo Repost' : 'Repost update'}
            >
              {!canShare ? (
                <LockKeyhole size={18} className="share-count-icon" aria-hidden="true" />
              ) : isSharing ? (
                <Spinner size="sm" color="#1860C3" />
              ) : (
                <Image
                  src="/share.png"
                  alt=""
                  width={14}
                  height={14}
                  className={`share-count-icon ${hasReposted ? 'mhn-repost-icon-filter' : ''}`}
                />
              )}
              <span
                className={`mhn-action-count ${hasReposted ? 'mhn-action-count-reposted' : ''}`}
              >
                {reposts}
              </span>
            </Button>
          )}
        </div>

        {showComments && (
          <PostCommentSection
            postId={id}
            initialCommentsCount={currentCommentsCount}
            onCommentAdded={(newCount) => setCurrentCommentsCount(newCount)}
          />
        )}
      </div>

      {isEditModalOpen && (
        <div
          className="mhn-modal-overlay"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="mhn-modal-card mhn-edit-post-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mhn-edit-post-header">
              <h3 className="mhn-edit-post-title">Edit Post</h3>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                className="mhn-edit-post-close-btn"
              >
                ✕
              </Button>
            </div>

            <Textarea
              value={editContentInput}
              onChange={(e) => setEditContentInput(e.target.value)}
              rows={4}
              className="mhn-edit-post-textarea"
            />

            <div className="mhn-edit-post-actions">
              <Button
                onClick={() => setIsEditModalOpen(false)}
                className="mhn-btn-edit-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="mhn-btn-edit-save"
              >
                {isUpdating && <Spinner size="sm" color="#FFFFFF" />}
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div
          className="mhn-modal-overlay"
          onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
        >
          <div
            className="mhn-modal-card mhn-delete-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mhn-delete-modal-header">
              <div className="mhn-dropdown-item-left">
                <div className="mhn-delete-icon-circle">
                  <Trash2 size={18} aria-hidden="true" />
                </div>
                <h3 className="mhn-delete-modal-title">
                  Delete Post
                </h3>
              </div>
              {!isDeleting && (
                <Button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mhn-delete-modal-close"
                  aria-label="Close modal"
                >
                  &times;
                </Button>
              )}
            </div>

            {/* Modal Body */}
            <p className="mhn-delete-modal-body">
              Are you sure you want to delete this post? This action is permanent and cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="mhn-delete-modal-actions">
              <Button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="mhn-btn-modal-cancel"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="mhn-btn-modal-danger"
              >
                {isDeleting ? (
                  <>
                    <Spinner size="sm" color="#FFFFFF" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
