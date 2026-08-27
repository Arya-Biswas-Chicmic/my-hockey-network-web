import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { FallbackImage } from '@/components/ui/fallback-image';
import { LockKeyhole, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export interface PostCardHeaderProps {
  authorName: string;
  authorRole: string;
  authorTime: string;
  authorAvatar: string;
  isSelf: boolean;
  canFollow: boolean;
  isFollowing: boolean;
  isFollowingLoading: boolean;
  onToggleFollow: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

/** Feed post card author row: avatar/name/role/time, plus the follow button
 * or (for the author's own post) the edit/delete "..." menu. Extracted from
 * `FeedPostCard.tsx`. */
export function PostCardHeader({
  authorName,
  authorRole,
  authorTime,
  authorAvatar,
  isSelf,
  canFollow,
  isFollowing,
  isFollowingLoading,
  onToggleFollow,
  isMenuOpen,
  onToggleMenu,
  onEditClick,
  onDeleteClick,
}: Readonly<PostCardHeaderProps>) {
  return (
    <div className="mhn-post-header">
      <div className="mhn-post-author-group">
        <div className="mhn-author-avatar-box">
          <FallbackImage
            src={authorAvatar}
            alt={authorName}
            fill
            className="mhn-author-avatar-img"
          />
        </div>
        <div className="mhn-author-meta">
          <h4 className="mhn-author-name">{authorName}</h4>
          <span className="mhn-author-subtitle">
            {authorRole} • {authorTime}
          </span>
        </div>
      </div>

      <div className="mhn-post-header-actions mhn-relative-container">
        {!isSelf && (
          <Button
            onClick={onToggleFollow}
            disabled={isFollowingLoading}
            className={`mhn-btn-follow ${isFollowing ? 'mhn-btn-following' : ''} ${isFollowingLoading ? 'mhn-loading' : ''}`}
            title={!canFollow ? 'Parent did not give permission' : undefined}
          >
            {!canFollow ? (
              <>
                <LockKeyhole size={14} aria-hidden="true" />
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
              onClick={onToggleMenu}
              className="mhn-btn-more-options"
              aria-label="More options"
            >
              <MoreHorizontal size={20} aria-hidden="true" />
            </Button>

            {isMenuOpen && (
              <div className="mhn-post-menu-popover">
                <Button onClick={onEditClick} className="mhn-post-menu-item">
                  <Pencil size={14} aria-hidden="true" />
                  <span>Edit Post</span>
                </Button>
                <Button onClick={onDeleteClick} className="mhn-post-menu-item-danger">
                  <Trash2 size={14} aria-hidden="true" />
                  <span>Delete Post</span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
