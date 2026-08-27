import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { PostCommentSection } from '@/components/features/home/PostCommentSection';
import { LockKeyhole, ThumbsUp } from 'lucide-react';
import Image from 'next/image';

export interface PostCardActionsProps {
  postId: string;
  isSelf: boolean;
  canReact: boolean;
  canComment: boolean;
  canShare: boolean;
  isLiked: boolean;
  likes: number;
  isLiking: boolean;
  onLike: () => void;
  showComments: boolean;
  onToggleComments: () => void;
  currentCommentsCount: number;
  onCommentAdded: (newCount: number) => void;
  hasReposted: boolean;
  reposts: number;
  isSharing: boolean;
  onShare: () => void;
}

/** Feed post card footer: like/comment/share action buttons plus the
 * (conditionally rendered) comment thread. Extracted from
 * `FeedPostCard.tsx`. */
export function PostCardActions({
  postId,
  isSelf,
  canReact,
  canComment,
  canShare,
  isLiked,
  likes,
  isLiking,
  onLike,
  showComments,
  onToggleComments,
  currentCommentsCount,
  onCommentAdded,
  hasReposted,
  reposts,
  isSharing,
  onShare,
}: Readonly<PostCardActionsProps>) {
  return (
    <div className="mhn-post-footer">
      <div className="mhn-post-actions-group">
        <Button
          onClick={onLike}
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
          onClick={onToggleComments}
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
            onClick={onShare}
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
            <span className={`mhn-action-count ${hasReposted ? 'mhn-action-count-reposted' : ''}`}>
              {reposts}
            </span>
          </Button>
        )}
      </div>

      {showComments && (
        <PostCommentSection
          postId={postId}
          initialCommentsCount={currentCommentsCount}
          onCommentAdded={onCommentAdded}
        />
      )}
    </div>
  );
}
