import React, { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/FormControls';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/hooks/use-auth';
import { PostCommentSection } from './PostCommentSection';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { formatDisplayName, formatUserAvatar, formatRoleTag } from '@/logic';
import { usePostReaction } from '@/hooks/usePostReaction';
import { usePostRepost } from '@/hooks/usePostRepost';
import { usePostDelete } from '@/hooks/usePostDelete';
import { usePostEdit } from '@/hooks/usePostEdit';
import { followUser, unfollowUser } from '@my-hockey-network/core';
import { ERROR_MESSAGES } from '@my-hockey-network/constants';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { normalizeApiError } from '@/logic/errors/errorNormalizer';

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
  isSelfRepost?: boolean;
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

  const { requirePermission } = useFeedPermissions(onNavigate);

  // Presentational state
  const [isFollowing, setIsFollowing] = useState<boolean>(initialFollowing);
  const [isFollowingLoading, setIsFollowingLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [currentCommentsCount, setCurrentCommentsCount] = useState<number>(commentsCount);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  // Dedicated focused action hooks
  const { isLiked, likesCount, isLiking, handleLike } = usePostReaction({
    postId: id,
    initialLiked: Boolean(userReaction),
    initialLikes,
  });

  const { hasReposted, repostsCount, isSharing, handleShare } = usePostRepost({
    postId: id,
    initialReposted: isSelfRepost || false,
    initialReposts,
    onShareSuccess,
    onRepostComplete,
  });

  const {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    isDeleted,
    confirmDelete,
  } = usePostDelete({
    postId: id,
    onDeleteSuccess,
    onShareSuccess,
    onRepostComplete,
  });

  const {
    postContent,
    isEditModalOpen,
    setIsEditModalOpen,
    editContentInput,
    setEditContentInput,
    isUpdating,
    saveEdit,
  } = usePostEdit({
    postId: id,
    initialContent,
    onUpdateSuccess,
  });

  if (isDeleted) {
    return null;
  }

  const toggleFollow = async () => {
    if (isFollowingLoading) return;
    setIsFollowingLoading(true);

    const targetKey = authorId || authorName;

    try {
      if (isFollowing) {
        await unfollowUser({ type: 'PROFILE', id: targetKey });
        setIsFollowing(false);
        if (onFollowChange) onFollowChange(targetKey, false);
        showSuccessToast(`Unfollowed ${authorName}`);
      } else {
        const res = await followUser({ type: 'PROFILE', id: targetKey });
        setIsFollowing(true);
        if (onFollowChange) onFollowChange(targetKey, true);
        showSuccessToast(res?.pendingGuardianApproval ? `Follow requested for ${authorName}` : `You are now following ${authorName}`);
      }
    } catch (err: unknown) {
      const appErr = normalizeApiError(err, ERROR_MESSAGES.FAILED_FOLLOW);
      showErrorToast(appErr, ERROR_MESSAGES.FAILED_FOLLOW);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  return (
    <article className="mhn-feed-post-card">
      <div className="mhn-post-header">
        <div className="mhn-post-author-group">
          <div className="mhn-author-avatar-box">
            <img
              src={formatUserAvatar(authorAvatar)}
              alt={formatDisplayName(authorName)}
              className="mhn-author-avatar-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/userPlaceholder.png';
              }}
            />
          </div>
          <div className="mhn-author-meta">
            <h4 className="mhn-author-name">{formatDisplayName(authorName)}</h4>
            <span className="mhn-author-subtitle">
              {formatRoleTag(authorRole)} • {authorTime}
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
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
            <div className="mhn-post-menu-container">
              <Button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="mhn-btn-more-options"
                aria-label="More options"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    <span>Edit Post</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDeleteModalOpen(true);
                    }}
                    className="mhn-post-menu-item-danger"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    <span>Delete Post</span>
                  </Button>
                </div>
              )}
            </div>
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
            <img
              src={postImage}
              alt="Post attachment"
              className="mhn-post-media-img"
              onError={(e) => {
                (e.target as HTMLImageElement).classList.add('mhn-display-none');
              }}
            />
          </div>
        )}
      </div>

      <div className="mhn-post-footer">
        <div className="mhn-post-actions-group">
          <Button
            onClick={handleLike}
            disabled={isLiking}
            className={`mhn-action-item ${isLiked ? 'mhn-action-liked' : ''}`}
            aria-label="Like post"
            title={!canReact ? 'Parent did not give permission' : undefined}
          >
            {!canReact ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" className="like-count-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : isLiking ? (
              <span className="like-count-icon mhn-flex-align-center mhn-flex-justify-center">
                <Spinner size="sm" color="#1860C3" />
              </span>
            ) : isLiked ? (
              <img src="/like.png" alt="" className="like-count-icon mhn-like-icon-red" />
            ) : (
              <img src="/like.png" alt="" className="like-count-icon" />
            )}
            <span className={`mhn-action-count ${isLiked ? 'mhn-action-count-liked' : ''}`}>{likesCount}</span>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" className="comment-count-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <img src="/comment.png" alt="" className="comment-count-icon" />
            )}
            <span className={`mhn-action-count ${showComments ? 'mhn-action-count-commented' : ''}`}>
              {currentCommentsCount}
            </span>
          </Button>

          <Button
            onClick={handleShare}
            disabled={isSharing}
            className={`mhn-action-item ${hasReposted ? 'mhn-action-active' : ''}`}
            aria-label="Share post"
            title={!canShare ? 'Parent did not give permission' : hasReposted ? 'Undo Repost' : 'Repost update'}
          >
            {!canShare ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" className="share-count-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : isSharing ? (
              <span className="share-count-icon mhn-flex-align-center mhn-flex-justify-center">
                <Spinner size="sm" color="#1860C3" />
              </span>
            ) : hasReposted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1860C3" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="share-count-icon">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            ) : (
              <img
                src="/share.png"
                alt=""
                className="share-count-icon"
              />
            )}
            <span
              className={`mhn-action-count ${hasReposted ? 'mhn-action-count-reposted' : ''}`}
            >
              {repostsCount}
            </span>
          </Button>
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
                onClick={saveEdit}
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
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
                onClick={confirmDelete}
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
