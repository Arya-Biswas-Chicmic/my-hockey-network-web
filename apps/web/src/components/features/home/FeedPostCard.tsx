import { Button } from '../../common/Button';
import { Textarea } from '../../common/FormControls';
import React, { useState, useEffect } from 'react';
import { likePost, unlikePost, repostPost, updatePost, deletePost, followUser, unfollowUser } from '@my-hockey-network/core';
import { Spinner } from '../../common/Spinner';

import { useAuth } from '../../../hooks/use-auth';
import { PostCommentSection } from './PostCommentSection';
import { useFeedPermissions } from '../../../hooks/use-feed-permissions';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../../utils/toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';


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
      await deletePost(id);
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
    } catch (err: any) {
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
      await updatePost(id, { body: editContentInput.trim() });
      setPostContent(editContentInput.trim());
      setIsEditModalOpen(false);
      showSuccessToast(SUCCESS_MESSAGES.POST_UPDATED);
      if (onUpdateSuccess) {
        onUpdateSuccess(id, editContentInput.trim());
      }
    } catch (err: any) {
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
      if (prevLiked) {
        await unlikePost(id);
      } else {
        const res = await likePost(id, 'LIKE');
        if ((res as any)?.pendingGuardianApproval || (res as any)?.message === 'REACTION_PENDING_APPROVAL') {
          showInfoToast('Your reaction has been submitted and is waiting for parent/guardian approval.');
          setIsLiked(prevLiked);
          setLikes(prevLikes);
        }
      }
    } catch (err: any) {
      console.error(`❌ [FeedPostCard] Reaction API Error:`, err);
      setIsLiked(prevLiked);
      setLikes(prevLikes);
      if (err?.statusCode === 403 && (err?.message?.includes('GUARDIAN_DISABLED') || err?.message?.includes('guardian'))) {
        showErrorToast(err, ERROR_MESSAGES.GUARDIAN_DISABLED_THIS_ACTION);
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
        await deletePost(targetDeleteId);
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
        const createdRepostId = res?.post?.id || (res as any)?.data?.post?.id || (res as any)?.data?.id;

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
    } catch (err: any) {
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
    } catch (err: any) {
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
            <img
              src={authorAvatar || '/userPlaceholder.png'}
              alt={authorName}
              className="mhn-author-avatar-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/userPlaceholder.png';
              }}
            />
          </div>
          <div className="mhn-author-meta">
            <h4 className="mhn-author-name">{authorName}</h4>
            <span className="mhn-author-subtitle">
              {authorRole} • {authorTime}
            </span>
          </div>
        </div>

        <div className="mhn-post-header-actions" style={{ position: 'relative' }}>
          {!isSelf && (
            <Button
              onClick={() => assertSupervisionPermission('follow_others', toggleFollow)}
              disabled={isFollowingLoading}
              className={`mhn-btn-follow ${isFollowing ? 'mhn-btn-following' : ''}`}
              title={!canFollow ? 'Parent did not give permission' : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minWidth: '82px',
                opacity: isFollowingLoading ? 0.75 : 1,
                cursor: isFollowingLoading ? 'not-allowed' : 'pointer',
              }}
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
            <>
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
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '36px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    border: '1px solid #E2E8F0',
                    zIndex: 50,
                    minWidth: '130px',
                    overflow: 'hidden',
                  }}
                >
                  <Button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setEditContentInput(postContent);
                      setIsEditModalOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    <span>Edit Post</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDeleteModalOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#EF4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderTop: '1px solid #F1F5F9',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
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
            <img
              src={postImage}
              alt="Post attachment"
              className="mhn-post-media-img"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" className="like-count-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : isLiked ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1860C3" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="like-count-icon">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            ) : (
              <img src="/like.png" alt="" className="like-count-icon" />
            )}
            <span className="mhn-action-count" style={{ color: isLiked ? '#1860C3' : undefined, fontWeight: isLiked ? 700 : undefined }}>{likes}</span>
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
            <span className="mhn-action-count" style={{ color: showComments ? '#0091FF' : undefined, fontWeight: showComments ? 700 : undefined }}>
              {currentCommentsCount}
            </span>
          </Button>

          {!isSelf && (
            <Button
              onClick={() => assertSupervisionPermission('share_posts', handleShare)}
              disabled={isSharing}
              className={`mhn-action-item ${hasReposted ? 'mhn-action-active' : ''}`}
              aria-label="Share post"
              title={!canShare ? 'Parent did not give permission' : hasReposted ? 'Undo Repost' : 'Repost update'}
              style={{ opacity: isSharing ? 0.7 : 1, cursor: isSharing ? 'not-allowed' : 'pointer' }}
            >
              {!canShare ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" className="share-count-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ) : isSharing ? (
                <Spinner size="sm" color="#1860C3" />
              ) : (
                <img
                  src="/share.png"
                  alt=""
                  className="share-count-icon"
                  style={hasReposted ? { filter: 'hue-rotate(200deg)' } : undefined}
                />
              )}
              <span
                className="mhn-action-count"
                style={{ color: hasReposted ? '#1860C3' : undefined, fontWeight: hasReposted ? 700 : undefined }}
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
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0F172A' }}>Edit Post</h3>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </Button>
            </div>

            <Textarea
              value={editContentInput}
              onChange={(e) => setEditContentInput(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#1860C3',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
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
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
        >
          <div
            className="mhn-modal-card"
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              animation: 'mhnPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FEF2F2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                  Delete Post
                </h3>
              </div>
              {!isDeleting && (
                <Button
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '22px',
                    color: '#64748B',
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                  aria-label="Close modal"
                >
                  &times;
                </Button>
              )}
            </div>

            {/* Modal Body */}
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Are you sure you want to delete this post? This action is permanent and cannot be undone.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <Button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isDeleting ? 0.8 : 1,
                }}
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
