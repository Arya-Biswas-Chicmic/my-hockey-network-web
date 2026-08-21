import { Button } from '../../common/Button';
import { Input } from '../../common/FormControls';
import React, { useState, useEffect } from 'react';
import { getComments, addComment } from '@my-hockey-network/core';
import { useAuth } from '../../../hooks/use-auth';
import { Spinner } from '../../common/Spinner';
import { resolveMediaUrl } from '../../../utils/mediaUtils';

export interface CommentItem {
  id: string;
  body: string;
  createdAt: string;
  likeCount?: number;
  authorProfileId?: string;
  authorProfile?: {
    id?: string;
    displayName?: string;
    avatarUrl?: string | null;
    position?: string | null;
    jerseyNumber?: number | null;
    primaryRole?: string | null;
  };
  author?: {
    id?: string;
    displayName?: string;
    avatarUrl?: string | null;
    primaryRole?: string | null;
  };
}

interface PostCommentSectionProps {
  postId: string;
  onCommentAdded?: (newCount: number) => void;
  initialCommentsCount?: number;
}

export const PostCommentSection: React.FC<PostCommentSectionProps> = ({
  postId,
  onCommentAdded,
  initialCommentsCount = 0,
}) => {
  const { user } = useAuth();
  const rawUserAvatar = user?.profile?.avatarUrl || (user as any)?.avatarUrl;
  const currentUserAvatar = resolveMediaUrl(rawUserAvatar, '/userPlaceholder.png');
  const currentUserName = user?.profile?.displayName || (user as any)?.displayName || 'You';

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [newCommentText, setNewCommentText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Liked comments state map
  const [likedComments, setLikedComments] = useState<Record<string, { count: number; isLiked: boolean }>>({});

  useEffect(() => {
    fetchPostComments();
  }, [postId]);

  const fetchPostComments = async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMsg(null);

    try {
      const res = await getComments(postId);
      
      const itemsList = res?.items || [];
      setComments(itemsList);
    } catch (err: any) {
      console.error(`❌ [PostCommentSection] Comments fetch error for post ${postId}:`, err);
      setIsError(true);
      setErrorMsg(err.message || 'Failed to load comments.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newCommentText.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    setStatusNotice(null);

    try {
      const res = await addComment(postId, text);

      const isPendingApproval =
        res?.message === 'COMMENT_PENDING_APPROVAL' ||
        res?.comment?.pendingGuardianApproval ||
        (res?.comment as any)?.status === 'PENDING';

      if (isPendingApproval) {
        setStatusNotice('Comment submitted for guardian approval.');
        setNewCommentText('');
      } else {
        const commentObj = res?.comment || {};
        const rawJersey = user?.profile?.jerseyNumber;
        const parsedJersey = rawJersey !== null && rawJersey !== undefined && rawJersey !== '' ? Number(rawJersey) : null;

        const newComment: CommentItem = {
          id: commentObj.id || `c_${Date.now()}`,
          body: commentObj.body || text,
          createdAt: commentObj.createdAt || new Date().toISOString(),
          likeCount: 0,
          authorProfile: {
            displayName: currentUserName,
            avatarUrl: currentUserAvatar,
            position: user?.profile?.position || undefined,
            jerseyNumber: parsedJersey,
            primaryRole: user?.profile?.type || 'PLAYER',
          },
        };

        setComments((prev) => [newComment, ...prev]);
        setNewCommentText('');

        if (onCommentAdded) {
          onCommentAdded(comments.length + 1);
        }
      }
    } catch (err: any) {
      console.error(`❌ [PostCommentSection] Add comment error:`, err);
      setStatusNotice(err.message || 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCommentLike = (commentId: string, initialCount = 0) => {
    setLikedComments((prev) => {
      const current = prev[commentId] || { count: initialCount, isLiked: false };
      const nextLiked = !current.isLiked;
      const nextCount = nextLiked ? current.count + 1 : Math.max(0, current.count - 1);
      return {
        ...prev,
        [commentId]: { count: nextCount, isLiked: nextLiked },
      };
    });
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="mhn-comment-section-container">
      {/* 1. Input Box Form */}
      <form className="mhn-comment-input-form" onSubmit={handleSendComment}>
        <img
          src={currentUserAvatar}
          alt={currentUserName}
          className="mhn-comment-current-user-avatar"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/userPlaceholder.png';
          }}
        />
        <div className="mhn-comment-input-wrapper">
          <Input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="mhn-comment-input-field"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={!newCommentText.trim() || isSubmitting}
            className="mhn-comment-send-btn"
            aria-label="Send comment"
            style={{
              backgroundColor: isSubmitting ? '#E0F2FE' : undefined,
              cursor: isSubmitting ? 'not-allowed' : undefined,
            }}
          >
            {isSubmitting ? (
              <Spinner size="sm" color="#0091FF" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </Button>
        </div>
      </form>

      {/* Notice Message Banner */}
      {statusNotice && (
        <div className={`mhn-comment-notice ${statusNotice.includes('submitted') ? 'mhn-notice-info' : 'mhn-notice-error'}`}>
          <span>{statusNotice}</span>
        </div>
      )}

      {/* 2. Loading State (Shimmer Skeleton) */}
      {isLoading ? (
        <div className="mhn-comment-skeleton-list">
          <div className="mhn-comment-skeleton-item">
            <div className="mhn-skeleton-avatar mhn-shimmer-box" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="mhn-skeleton-line mhn-shimmer-box" style={{ width: '40%', height: 14 }} />
              <div className="mhn-skeleton-line mhn-shimmer-box" style={{ width: '85%', height: 12 }} />
            </div>
          </div>
          <div className="mhn-comment-skeleton-item">
            <div className="mhn-skeleton-avatar mhn-shimmer-box" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="mhn-skeleton-line mhn-shimmer-box" style={{ width: '30%', height: 14 }} />
              <div className="mhn-skeleton-line mhn-shimmer-box" style={{ width: '70%', height: 12 }} />
            </div>
          </div>
        </div>
      ) : isError ? (
        /* 3. Error State */
        <div className="mhn-comment-error-box">
          <p>{errorMsg || 'Failed to load comments.'}</p>
          <Button type="button" onClick={fetchPostComments} className="mhn-comment-retry-btn">
            Retry
          </Button>
        </div>
      ) : comments.length === 0 ? (
        /* 4. Empty State */
        <div className="mhn-comment-empty-box">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>No comments yet. Be the first to share your thoughts!</span>
        </div>
      ) : (
        /* 5. Real Comments List */
        <div className="mhn-comment-list">
          {comments.map((item) => {
            const author = item.authorProfile || item.author || {};
            const authorAny = author as any;
            const authorName = authorAny.displayName || 'Network Member';
            const authorAvatar = resolveMediaUrl(authorAny.avatarUrl, '/userPlaceholder.png');
            const roleText = authorAny.position && authorAny.jerseyNumber
              ? `${authorAny.position} • #${authorAny.jerseyNumber}`
              : authorAny.position || authorAny.primaryRole || authorAny.type || 'Member';
            const timeText = formatRelativeTime(item.createdAt);

            const likeInfo = likedComments[item.id] || { count: item.likeCount || 0, isLiked: false };

            return (
              <div key={item.id} className="mhn-comment-card">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="mhn-comment-author-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                  }}
                />
                <div className="mhn-comment-bubble-wrapper">
                  <div className="mhn-comment-bubble">
                    <div className="mhn-comment-meta-row">
                      <h5 className="mhn-comment-author-name">{authorName}</h5>
                      <span className="mhn-comment-role-pill">{roleText}</span>
                      <span className="mhn-comment-time">{timeText}</span>
                    </div>
                    <p className="mhn-comment-text">{item.body || (item as any).text || (item as any).content}</p>
                  </div>

                  {/* Comment Action Footer (Like / Reply) */}
                  <div className="mhn-comment-actions-bar">
                    <Button
                      type="button"
                      onClick={() => toggleCommentLike(item.id, item.likeCount || 0)}
                      className={`mhn-comment-action-btn ${likeInfo.isLiked ? 'mhn-comment-liked' : ''}`}
                    >
                      {likeInfo.isLiked ? 'Liked' : 'Like'} {likeInfo.count > 0 && `(${likeInfo.count})`}
                    </Button>
                    <span className="mhn-comment-dot">•</span>
                    <Button type="button" className="mhn-comment-action-btn">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
