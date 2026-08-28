import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { PostCommentSection } from '@/components/features/home/PostCommentSection';
import {
  FeedLikeSparkIcon,
  FeedCommentIcon,
  FeedRepostIcon,
  FeedShareIcon,
  FeedSaveIcon,
  FeedSaveFilledIcon,
  RepostMenuRepostIcon,
  RepostMenuQuoteIcon,
} from '@/components/icons/FeedActionIcons';
import { LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { showInfoToast } from '@/utils/toast';
import { formatCompactNumber } from '@/helpers/formatters';

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
  isRepostMenuOpen: boolean;
  onRepostButtonClick: () => void;
  onCloseRepostMenu: () => void;
  onChooseRepost: () => void;
  onChooseQuote: () => void;
}

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
  isRepostMenuOpen,
  onRepostButtonClick,
  onCloseRepostMenu,
  onChooseRepost,
  onChooseQuote,
}: Readonly<PostCardActionsProps>) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="mhn-post-footer px-4 py-3 border-t border-slate-800/60">
      <div className="mhn-post-actions-group flex items-center justify-between">
        <div className="mhn-post-actions-group-left flex items-center gap-5">
          <Button
            onClick={onLike}
            disabled={isLiking}
            className="mhn-action-item flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Like post"
            title={!canReact ? 'Parent did not give permission' : undefined}
          >
            {!canReact ? (
              <LockKeyhole size={16} className="text-slate-500" aria-hidden="true" />
            ) : (
              <span className={`mhn-like-badge flex items-center justify-center h-4 w-4 rounded-full ${isLiked ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-500'}`}>
                <FeedLikeSparkIcon size={12} aria-hidden="true" />
              </span>
            )}
            <span className="mhn-action-count font-medium">{formatCompactNumber(likes)}</span>
          </Button>

          <Button
            onClick={onToggleComments}
            className={`mhn-action-item flex items-center gap-1.5 text-xs transition-colors ${
              showComments ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Toggle comments"
            title={!canComment ? 'Parent did not give permission' : undefined}
          >
            {!canComment ? (
              <LockKeyhole size={16} className="text-slate-500" aria-hidden="true" />
            ) : (
              <FeedCommentIcon size={16} className="comment-count-icon text-slate-400" aria-hidden="true" />
            )}
            <span className="mhn-action-count font-medium">{formatCompactNumber(currentCommentsCount)}</span>
          </Button>

          {!isSelf && (
            <div className="mhn-repost-menu-wrapper relative">
              <Button
                onClick={onRepostButtonClick}
                disabled={isSharing}
                className={`mhn-action-item flex items-center gap-1.5 text-xs transition-colors ${
                  hasReposted ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label="Repost"
                aria-haspopup="menu"
                aria-expanded={isRepostMenuOpen}
                title={!canShare ? 'Parent did not give permission' : hasReposted ? 'Undo Repost' : 'Repost or Quote'}
              >
                {!canShare ? (
                  <LockKeyhole size={16} className="text-slate-500" aria-hidden="true" />
                ) : isSharing ? (
                  <Spinner size="sm" color="#10B981" />
                ) : (
                  <FeedRepostIcon
                    size={16}
                    className={`share-count-icon ${hasReposted ? 'text-emerald-400' : 'text-slate-400'}`}
                    aria-hidden="true"
                  />
                )}
                <span className="mhn-action-count font-medium">{formatCompactNumber(reposts)}</span>
              </Button>

              {isRepostMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={onCloseRepostMenu}
                  />
                  <div className="mhn-repost-menu-popover absolute left-0 bottom-8 z-30 w-32 rounded-xl border border-slate-800 bg-slate-900 p-1 shadow-xl" role="menu">
                    <Button onClick={onChooseRepost} className="mhn-repost-menu-item flex w-full items-center gap-2 rounded-lg p-2 text-xs text-slate-200 hover:bg-slate-800" role="menuitem">
                      <RepostMenuRepostIcon size={16} aria-hidden="true" />
                      <span>Repost</span>
                    </Button>
                    <Button onClick={onChooseQuote} className="mhn-repost-menu-item flex w-full items-center gap-2 rounded-lg p-2 text-xs text-slate-200 hover:bg-slate-800" role="menuitem">
                      <RepostMenuQuoteIcon size={16} aria-hidden="true" />
                      <span>Quote</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mhn-post-actions-group-right flex items-center gap-4 text-slate-400">
          <Button
            onClick={() => showInfoToast('Sharing posts externally is not available yet.')}
            className="mhn-action-item hover:text-slate-200 transition-colors p-1"
            aria-label="Send post"
            title="Send"
          >
            <FeedShareIcon size={18} aria-hidden="true" />
          </Button>

          <Button
            onClick={() => {
              setIsSaved((prev) => !prev);
              showInfoToast(isSaved ? 'Removed from Saved.' : 'Saved — the Saved page is coming soon.');
            }}
            className={`mhn-action-item transition-colors p-1 ${isSaved ? 'text-blue-400' : 'hover:text-slate-200'}`}
            aria-label={isSaved ? 'Remove from saved' : 'Save post'}
            title={isSaved ? 'Remove from saved' : 'Save'}
          >
            {isSaved ? (
              <FeedSaveFilledIcon size={18} className="text-blue-400" aria-hidden="true" />
            ) : (
              <FeedSaveIcon size={18} aria-hidden="true" />
            )}
          </Button>
        </div>
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
