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

/** Feed post card footer: like/comment/repost/send/save action buttons plus
 * the (conditionally rendered) comment thread. Extracted from
 * `FeedPostCard.tsx`. Icon set and two-group (left/right) layout match the
 * Figma "Footer of post" design (figma.com/design/cqlBXHZtqPkKcLRmR6a1B8,
 * node 1398:3904) — see `components/icons/FeedActionIcons.tsx`. */
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
  // Save/bookmark has no backend endpoint yet (no `savePost`/`SavedPost` API
  // anywhere in `packages/core`) — this is a client-only optimistic toggle,
  // matching the "Saved" nav page, which is itself a coming-soon stub
  // (`screens/saved-page.tsx`). Remove this local state once a real
  // save-posts endpoint exists and wire it the same way `isLiked` is wired.
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="mhn-post-footer">
      <div className="mhn-post-actions-group">
        <div className="mhn-post-actions-group-left">
          <Button
            onClick={onLike}
            disabled={isLiking}
            className="mhn-action-item"
            aria-label="Like post"
            title={!canReact ? 'Parent did not give permission' : undefined}
          >
            {!canReact ? (
              <LockKeyhole size={18} className="like-count-icon" aria-hidden="true" />
            ) : (
              <span className={`mhn-like-badge ${isLiked ? 'mhn-like-badge-active' : ''}`}>
                <FeedLikeSparkIcon size={15} className="like-count-icon" aria-hidden="true" />
              </span>
            )}
            <span className="mhn-action-count">{likes}</span>
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
              <FeedCommentIcon size={16} className="comment-count-icon" aria-hidden="true" />
            )}
            <span className={`mhn-action-count ${showComments ? 'mhn-action-count-commented' : ''}`}>
              {currentCommentsCount}
            </span>
          </Button>

          {!isSelf && (
            <div className="mhn-repost-menu-wrapper">
              <Button
                onClick={onRepostButtonClick}
                disabled={isSharing}
                className={`mhn-action-item ${hasReposted ? 'mhn-action-active' : ''} ${isSharing ? 'mhn-loading' : ''}`}
                aria-label="Repost"
                aria-haspopup="menu"
                aria-expanded={isRepostMenuOpen}
                title={!canShare ? 'Parent did not give permission' : hasReposted ? 'Undo Repost' : 'Repost or Quote'}
              >
                {!canShare ? (
                  <LockKeyhole size={18} className="share-count-icon" aria-hidden="true" />
                ) : isSharing ? (
                  <Spinner size="sm" color="#1860C3" />
                ) : (
                  <FeedRepostIcon
                    size={16}
                    className={`share-count-icon ${hasReposted ? 'mhn-repost-icon-active' : ''}`}
                    aria-hidden="true"
                  />
                )}
                <span className={`mhn-action-count ${hasReposted ? 'mhn-action-count-reposted' : ''}`}>
                  {reposts}
                </span>
              </Button>

              {/* Repost/Quote choice popover (Figma: figma.com/design/
                  cqlBXHZtqPkKcLRmR6a1B8, node 1766:8766) — only offered
                  before reposting; clicking the button when already
                  reposted undoes directly (see `onRepostButtonClick`). */}
              {isRepostMenuOpen && (
                <>
                  <Button
                    className="mhn-repost-menu-backdrop"
                    aria-label="Close repost menu"
                    onClick={onCloseRepostMenu}
                  >
                    <span className="sr-only">Close repost menu</span>
                  </Button>
                  <div className="mhn-repost-menu-popover" role="menu">
                    <Button onClick={onChooseRepost} className="mhn-repost-menu-item" role="menuitem">
                      <RepostMenuRepostIcon size={20} aria-hidden="true" />
                      <span>Repost</span>
                    </Button>
                    <Button onClick={onChooseQuote} className="mhn-repost-menu-item" role="menuitem">
                      <RepostMenuQuoteIcon size={20} aria-hidden="true" />
                      <span>Quote</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mhn-post-actions-group-right">
          <Button
            onClick={() => showInfoToast('Sharing posts externally is not available yet.')}
            className="mhn-action-item mhn-action-icon-only"
            aria-label="Send post"
            title="Send"
          >
            <FeedShareIcon size={19} className="share-count-icon" aria-hidden="true" />
          </Button>

          <Button
            onClick={() => {
              setIsSaved((prev) => !prev);
              showInfoToast(isSaved ? 'Removed from Saved.' : 'Saved — the Saved page is coming soon.');
            }}
            className={`mhn-action-item mhn-action-icon-only ${isSaved ? 'mhn-action-active' : ''}`}
            aria-label={isSaved ? 'Remove from saved' : 'Save post'}
            title={isSaved ? 'Remove from saved' : 'Save'}
          >
            {isSaved ? (
              <FeedSaveFilledIcon size={20} className="save-count-icon mhn-action-count-saved" aria-hidden="true" />
            ) : (
              <FeedSaveIcon size={20} className="save-count-icon" aria-hidden="true" />
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
