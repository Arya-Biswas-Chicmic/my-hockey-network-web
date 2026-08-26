import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import React, { useState, useEffect } from 'react';
import { getComments, addComment } from '@my-hockey-network/core';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/common/Spinner';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { MessageSquare, Send } from 'lucide-react';
import { useFormik } from 'formik';

export interface CommentItem {
  id: string;
  body: string;
  text?: string;
  content?: string;
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
    type?: string | null;
  };
  author?: {
    id?: string;
    displayName?: string;
    avatarUrl?: string | null;
    position?: string | null;
    jerseyNumber?: number | null;
    primaryRole?: string | null;
    type?: string | null;
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
  const { requirePermission } = useFeedPermissions();
  const rawUserAvatar = user?.profile?.avatarUrl;
  const currentUserAvatar = resolveMediaUrl(rawUserAvatar, '/userPlaceholder.png');
  const currentUserName = user?.profile?.displayName || 'You';

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Liked comments state map
  const [likedComments, setLikedComments] = useState<Record<string, { count: number; isLiked: boolean }>>({});

  const commentForm = useFormik({
    initialValues: { comment: '' },
    validate: ({ comment }) => comment.trim() ? {} : { comment: 'Write a comment before sending.' },
    onSubmit: async ({ comment }, helpers) => {
      if (!requirePermission('COMMENT_ON_POSTS')) return;
      const text = comment.trim();
      setStatusNotice(null);

      try {
        const response = await addComment(postId, text);
        const isPendingApproval =
          response?.message === 'COMMENT_PENDING_APPROVAL' ||
          response?.comment?.pendingGuardianApproval ||
          (response?.comment as { status?: string } | undefined)?.status === 'PENDING';

        if (isPendingApproval) {
          setStatusNotice('Your comment has been submitted and is waiting for parent/guardian approval.');
          helpers.resetForm();
          return;
        }

        const commentResponse = response?.comment || {};
        const rawJersey = user?.profile?.jerseyNumber;
        const parsedJersey = rawJersey !== null && rawJersey !== undefined && rawJersey !== '' ? Number(rawJersey) : null;
        const newComment: CommentItem = {
          id: commentResponse.id || `c_${Date.now()}`,
          body: commentResponse.body || text,
          createdAt: commentResponse.createdAt || new Date().toISOString(),
          likeCount: 0,
          authorProfile: {
            displayName: currentUserName,
            avatarUrl: currentUserAvatar,
            position: user?.profile?.position || undefined,
            jerseyNumber: parsedJersey,
            primaryRole: user?.profile?.type || 'PLAYER',
          },
        };

        setComments((previous) => [newComment, ...previous]);
        helpers.resetForm();
        onCommentAdded?.(comments.length + 1);
      } catch (error: unknown) {
        const apiError = error as { statusCode?: number; message?: string };
        if (apiError.statusCode === 403 && (apiError.message?.includes('GUARDIAN_DISABLED') || apiError.message?.includes('guardian'))) {
          setStatusNotice('A guardian has turned this action off for this account.');
        } else {
          setStatusNotice(apiError.message || 'Failed to post comment. Please try again.');
        }
      }
    },
  });

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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load comments.';
      setIsError(true);
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
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
      <form className="mhn-comment-input-form" onSubmit={commentForm.handleSubmit} noValidate>
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
            name="comment"
            value={commentForm.values.comment}
            onChange={commentForm.handleChange}
            placeholder="Write a comment..."
            className="mhn-comment-input-field"
            disabled={commentForm.isSubmitting}
          />
          <Button
            type="submit"
            disabled={!commentForm.values.comment.trim() || commentForm.isSubmitting}
            className={`mhn-comment-send-btn ${commentForm.isSubmitting ? 'mhn-submitting' : ''}`}
            aria-label="Send comment"
          >
            {commentForm.isSubmitting ? (
              <Spinner size="sm" color="#0091FF" />
            ) : (
              <Send size={18} aria-hidden="true" />
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
            <div className="mhn-skeleton-avatar mhn-shimmer-box mhn-comment-skeleton-avatar" />
            <div className="mhn-comment-skeleton-meta">
              <div className="mhn-skeleton-line mhn-shimmer-box mhn-comment-skeleton-name" />
              <div className="mhn-skeleton-line mhn-shimmer-box mhn-comment-skeleton-body" />
            </div>
          </div>
          <div className="mhn-comment-skeleton-item">
            <div className="mhn-skeleton-avatar mhn-shimmer-box mhn-comment-skeleton-avatar" />
            <div className="mhn-comment-skeleton-meta">
              <div className="mhn-skeleton-line mhn-shimmer-box mhn-comment-skeleton-name-short" />
              <div className="mhn-skeleton-line mhn-shimmer-box mhn-comment-skeleton-body-short" />
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
          <MessageSquare size={32} color="#94A3B8" aria-hidden="true" />
          <span>No comments yet. Be the first to share your thoughts!</span>
        </div>
      ) : (
        /* 5. Real Comments List */
        <div className="mhn-comment-list">
          {comments.map((item) => {
            const author = item.authorProfile || item.author || {};
            const authorName = author.displayName || 'Network Member';
            const authorAvatar = resolveMediaUrl(author.avatarUrl, '/userPlaceholder.png');
            const roleText = author.position && author.jerseyNumber
              ? `${author.position} • #${author.jerseyNumber}`
              : author.position || author.primaryRole || author.type || 'Member';
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
                    <p className="mhn-comment-text">{item.body || item.text || item.content}</p>
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
