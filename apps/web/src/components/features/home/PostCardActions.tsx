import { Button } from '@/components/common/Button';
import { supervisionBlockedMessage } from '@my-hockey-network/domain';
import { PermissionControlKey } from '@my-hockey-network/contracts';
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
import { useState } from 'react';
import { showErrorToast, showInfoToast } from '@/utils/toast';
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
    <div className="mhn-post-footer">
      <div className="mhn-post-actions-group">
        <div className="mhn-post-actions-group-left">
          <Button
            onClick={onLike}
            disabled={isLiking}
            className={`mhn-action-item ${!canReact ? 'mhn-action-item-blocked' : ''}`}
            aria-label={
              canReact
                ? 'Like post'
                : `Like post — ${supervisionBlockedMessage(PermissionControlKey.REACT_TO_POSTS)}`
            }
            title={!canReact ? supervisionBlockedMessage(PermissionControlKey.REACT_TO_POSTS) : undefined}
          >
            <span className={`mhn-like-badge ${isLiked ? 'mhn-like-badge-active' : ''}`}>
              <FeedLikeSparkIcon size={12} aria-hidden="true" />
            </span>
            <span className="mhn-action-count">{formatCompactNumber(likes)}</span>
          </Button>

          <Button
            onClick={onToggleComments}
            className={`mhn-action-item ${showComments ? 'mhn-action-item-active' : ''} ${!canComment ? 'mhn-action-item-blocked' : ''}`}
            aria-label={
              canComment
                ? 'Toggle comments'
                : `Comments — ${supervisionBlockedMessage(PermissionControlKey.COMMENT_ON_POSTS)}`
            }
            title={!canComment ? supervisionBlockedMessage(PermissionControlKey.COMMENT_ON_POSTS) : undefined}
          >
            <FeedCommentIcon size={16} className="comment-count-icon text-slate-400" aria-hidden="true" />
            <span className="mhn-action-count">{formatCompactNumber(currentCommentsCount)}</span>
          </Button>

          {!isSelf && (
            <div className="mhn-repost-menu-wrapper relative">
              <Button
                onClick={onRepostButtonClick}
                disabled={isSharing}
                className={`mhn-action-item ${hasReposted ? 'mhn-action-item-reposted' : ''} ${!canShare ? 'mhn-action-item-blocked' : ''}`}
                aria-label={
                  canShare
                    ? 'Repost'
                    : `Repost — ${supervisionBlockedMessage(PermissionControlKey.SHARE_POSTS)}`
                }
                aria-haspopup="menu"
                aria-expanded={isRepostMenuOpen}
                title={!canShare ? supervisionBlockedMessage(PermissionControlKey.SHARE_POSTS) : hasReposted ? 'Undo Repost' : 'Repost or Quote'}
              >
                {isSharing ? (
                  <Spinner size="sm" color="#10B981" />
                ) : (
                  <FeedRepostIcon
                    size={16}
                    className={`share-count-icon ${hasReposted ? 'text-emerald-400' : 'text-slate-400'}`}
                    aria-hidden="true"
                  />
                )}
                <span className="mhn-action-count">{formatCompactNumber(reposts)}</span>
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

        <div className="mhn-post-actions-group-right">
          {/* Sending a post externally is sharing, so it is governed by the same
              SHARE_POSTS control as the repost button above — it was previously
              the one share action a guardian could not restrict. Follows the
              same pattern as the others: real icon kept, dimmed, not disabled,
              with the reason toasted on click. */}
          <Button
            onClick={() =>
              canShare
                ? showInfoToast('Sharing posts externally is not available yet.')
                : showErrorToast(supervisionBlockedMessage(PermissionControlKey.SHARE_POSTS))
            }
            className={`mhn-action-item mhn-action-icon-only ${!canShare ? 'mhn-action-item-blocked' : ''}`}
            aria-label={
              canShare
                ? 'Send post'
                : `Send post — ${supervisionBlockedMessage(PermissionControlKey.SHARE_POSTS)}`
            }
            title={!canShare ? supervisionBlockedMessage(PermissionControlKey.SHARE_POSTS) : 'Send'}
          >
            <FeedShareIcon size={18} aria-hidden="true" />
          </Button>

          <Button
            onClick={() => {
              setIsSaved((prev) => !prev);
              showInfoToast(isSaved ? 'Removed from Saved.' : 'Saved — the Saved page is coming soon.');
            }}
            className={`mhn-action-item mhn-action-icon-only ${isSaved ? 'mhn-action-item-active' : ''}`}
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
