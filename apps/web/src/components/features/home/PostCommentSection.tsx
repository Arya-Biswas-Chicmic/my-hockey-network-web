import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import React, { useState } from 'react';
import { getComments, addComment, type PostCommentItem } from '@my-hockey-network/core';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/common/Spinner';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { formatRelativeTime } from '@/utils/dateUtils';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { MessageSquare, Send } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { commentFormSchema, type CommentFormValues } from '@my-hockey-network/validation';
import { QueryKeys } from '@my-hockey-network/contracts';
import { Form } from '@/components/ui/form';
import { FallbackImage } from '@/components/ui/fallback-image';

export type CommentItem = PostCommentItem;

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

  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Liked comments state map
  const [likedComments, setLikedComments] = useState<Record<string, { count: number; isLiked: boolean }>>({});

  const queryClient = useQueryClient();
  const commentsQueryKey = [QueryKeys.POST_COMMENTS, postId] as const;
  const commentsQuery = useQuery({
    queryKey: commentsQueryKey,
    queryFn: () => getComments(postId),
  });
  const comments = (commentsQuery.data?.items ?? []) as CommentItem[];

  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    mode: 'onChange',
    defaultValues: { comment: '' },
  });
  const commentValue = useWatch({ control: commentForm.control, name: 'comment' });
  const addCommentMutation = useMutation({ mutationFn: (text: string) => addComment(postId, text) });
  const handleCommentSubmit = commentForm.handleSubmit(async ({ comment }) => {
      if (!requirePermission('COMMENT_ON_POSTS')) return;
      const text = comment.trim();
      setStatusNotice(null);

      try {
        const response = await addCommentMutation.mutateAsync(text);
        const isPendingApproval =
          response?.message === 'COMMENT_PENDING_APPROVAL' ||
          response?.comment?.pendingGuardianApproval ||
          (response?.comment as { status?: string } | undefined)?.status === 'PENDING';

        if (isPendingApproval) {
          setStatusNotice('Your comment has been submitted and is waiting for parent/guardian approval.');
          commentForm.reset();
          return;
        }

        const commentResponse = response?.comment || {};
        if (!commentResponse.id) {
          await queryClient.invalidateQueries({ queryKey: commentsQueryKey });
          commentForm.reset();
          return;
        }
        const rawJersey = user?.profile?.jerseyNumber;
        const parsedJersey = rawJersey !== null && rawJersey !== undefined && rawJersey !== '' ? Number(rawJersey) : null;
        const newComment: CommentItem = {
          id: commentResponse.id,
          body: commentResponse.body || text,
          createdAt: commentResponse.createdAt || '',
          likeCount: 0,
          authorProfile: {
            id: user?.profile?.id || user?.id || 'current-user',
            displayName: currentUserName,
            avatarUrl: currentUserAvatar,
            position: user?.profile?.position || undefined,
            jerseyNumber: parsedJersey ?? undefined,
            primaryRole: user?.profile?.type || 'PLAYER',
          },
        };

        queryClient.setQueryData<Awaited<ReturnType<typeof getComments>>>(commentsQueryKey, (current) => ({
          ...(current ?? { items: [] }),
          items: [newComment, ...((current?.items ?? []) as CommentItem[])],
        }));
        commentForm.reset();
        onCommentAdded?.(comments.length + 1);
      } catch (error: unknown) {
        const apiError = error as { statusCode?: number; message?: string };
        if (apiError.statusCode === 403 && (apiError.message?.includes('GUARDIAN_DISABLED') || apiError.message?.includes('guardian'))) {
          setStatusNotice('A guardian has turned this action off for this account.');
        } else {
          setStatusNotice(apiError.message || 'Failed to post comment. Please try again.');
        }
      }
  });

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

  return (
    <div className="mhn-comment-section-container">
      {/* 1. Input Box Form */}
      <Form methods={commentForm} className="mhn-comment-input-form" onSubmit={handleCommentSubmit} noValidate>
        <FallbackImage
          src={currentUserAvatar}
          alt={currentUserName}
          width={36}
          height={36}
          className="mhn-comment-current-user-avatar"
        />
        <div className="mhn-comment-input-wrapper">
          <Input
            type="text"
            {...commentForm.register('comment')}
            placeholder="Write a comment..."
            className="mhn-comment-input-field"
            disabled={commentForm.formState.isSubmitting}
          />
          <Button
            type="submit"
            disabled={!commentValue.trim() || commentForm.formState.isSubmitting}
            className={`mhn-comment-send-btn ${commentForm.formState.isSubmitting ? 'mhn-submitting' : ''}`}
            aria-label="Send comment"
          >
            {commentForm.formState.isSubmitting ? (
              <Spinner size="sm" color="#0091FF" />
            ) : (
              <Send size={18} aria-hidden="true" />
            )}
          </Button>
        </div>
      </Form>

      {/* Notice Message Banner */}
      {statusNotice && (
        <div className={`mhn-comment-notice ${statusNotice.includes('submitted') ? 'mhn-notice-info' : 'mhn-notice-error'}`}>
          <span>{statusNotice}</span>
        </div>
      )}

      {/* 2. Loading State (Shimmer Skeleton) */}
      {commentsQuery.isLoading ? (
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
      ) : commentsQuery.isError ? (
        /* 3. Error State */
        <div className="mhn-comment-error-box">
          <p>{commentsQuery.error instanceof Error ? commentsQuery.error.message : 'Failed to load comments.'}</p>
          <Button type="button" onClick={() => void commentsQuery.refetch()} className="mhn-comment-retry-btn">
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
            const author = item.authorProfile ?? item.author;
            const authorName = author?.displayName || 'Network Member';
            const authorAvatar = resolveMediaUrl(author?.avatarUrl, '/userPlaceholder.png');
            const roleText = author?.position && author.jerseyNumber
              ? `${author.position} • #${author.jerseyNumber}`
              : author?.position || author?.primaryRole || author?.type || 'Member';
            const timeText = formatRelativeTime(item.createdAt);

            const likeInfo = likedComments[item.id] || { count: item.likeCount || 0, isLiked: false };

            return (
              <div key={item.id} className="mhn-comment-card">
                <FallbackImage
                  src={authorAvatar}
                  alt={authorName}
                  width={32}
                  height={32}
                  className="mhn-comment-author-avatar"
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
