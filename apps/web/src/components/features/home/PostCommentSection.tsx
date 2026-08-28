import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import React, { useState } from 'react';
import { getComments, addComment, type PostCommentItem } from '@my-hockey-network/core';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/common/Spinner';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { formatRelativeTime } from '@/utils/dateUtils';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { MessageSquare, Send, Heart, Smile, Paperclip } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { commentFormSchema, type CommentFormValues } from '@my-hockey-network/validation';
import { QueryKeys } from '@my-hockey-network/contracts';
import { Form } from '@/components/ui/form';
import { FallbackImage } from '@/components/ui/fallback-image';
import { formatCompactNumber } from '@/helpers/formatters';

export type CommentItem = PostCommentItem;

interface PostCommentSectionProps {
  postId: string;
  onCommentAdded?: (newCount: number) => void;
  initialCommentsCount?: number;
  placeholder?: string;
}

export const PostCommentSection: React.FC<PostCommentSectionProps> = ({
  postId,
  onCommentAdded,
  initialCommentsCount = 0,
  placeholder = 'Write a comment...',
}) => {
  const { user } = useAuth();
  const { requirePermission } = useFeedPermissions();
  const rawUserAvatar = user?.profile?.avatarUrl;
  const currentUserAvatar = resolveMediaUrl(rawUserAvatar, '/userPlaceholder.webp');
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
    <div className="mhn-comment-section-container mt-4 flex flex-col gap-4">
      {/* Real Comments List */}
      {commentsQuery.isLoading ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-slate-800 shrink-0" />
            <div className="flex-1 rounded-2xl bg-slate-800/60 h-16" />
          </div>
        </div>
      ) : commentsQuery.isError ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center justify-between">
          <span>{commentsQuery.error instanceof Error ? commentsQuery.error.message : 'Failed to load comments.'}</span>
          <Button onClick={() => void commentsQuery.refetch()} className="font-semibold underline">Retry</Button>
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 text-center text-xs text-slate-400 gap-1">
          <MessageSquare size={20} className="text-slate-500 mb-1" />
          <span>No comments yet. Be the first to reply!</span>
        </div>
      ) : (
        <div className="mhn-comment-list flex flex-col gap-3">
          {comments.map((item) => {
            const author = item.authorProfile ?? item.author;
            const authorName = author?.displayName || 'Network Member';
            const authorAvatar = resolveMediaUrl(author?.avatarUrl, '/userPlaceholder.webp');
            const timeText = formatRelativeTime(item.createdAt) || 'Just now';

            const likeInfo = likedComments[item.id] || { count: item.likeCount || 0, isLiked: false };

            return (
              <div key={item.id} className="mhn-comment-card flex items-start gap-3">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-800">
                  <FallbackImage
                    src={authorAvatar}
                    alt={authorName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Figma Comment Bubble Container */}
                  <div className="mhn-comment-bubble rounded-2xl border border-slate-800/60 bg-[#0d1b32] p-3 shadow-sm relative">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-100 truncate">{authorName}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{timeText}</span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed word-break">{item.body || item.text || item.content}</p>

                    {/* Reaction Badges below bubble */}
                    <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-800/40">
                      <Button
                        onClick={() => toggleCommentLike(item.id, item.likeCount || 0)}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                          likeInfo.isLiked
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        <Heart size={11} className={likeInfo.isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                        <span>{likeInfo.count > 0 ? formatCompactNumber(likeInfo.count) : 'Like'}</span>
                      </Button>

                      <Button
                        className="text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Message Banner */}
      {statusNotice && (
        <div className={`p-2.5 rounded-xl text-xs ${statusNotice.includes('submitted') ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Figma Styled Comment Input Form */}
      <Form methods={commentForm} className="mhn-comment-input-form flex items-center gap-2" onSubmit={handleCommentSubmit} noValidate>
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-800">
          <FallbackImage
            src={currentUserAvatar}
            alt={currentUserName}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 flex items-center gap-2 rounded-2xl border border-slate-800 bg-[#091222] p-1.5 pl-4 shadow-inner">
          <Input
            type="text"
            {...commentForm.register('comment')}
            placeholder={placeholder}
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 outline-none"
            disabled={commentForm.formState.isSubmitting}
          />

          <div className="flex items-center gap-1.5 shrink-0 pr-1">
            <Button className="text-slate-400 hover:text-slate-200 p-1" aria-label="Add emoji">
              <Smile size={16} />
            </Button>
            <Button className="text-slate-400 hover:text-slate-200 p-1" aria-label="Attach file">
              <Paperclip size={16} />
            </Button>

            <Button
              type="submit"
              disabled={!commentValue.trim() || commentForm.formState.isSubmitting}
              className={`flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition-all shadow-md ${
                !commentValue.trim() || commentForm.formState.isSubmitting
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'hover:bg-blue-500 active:scale-95'
              }`}
              aria-label="Send comment"
            >
              {commentForm.formState.isSubmitting ? (
                <Spinner size="sm" color="#FFFFFF" />
              ) : (
                <Send size={14} className="ml-0.5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};
