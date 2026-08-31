import { Button } from '@/components/common/Button';
import { supervisionBlockedMessage } from '@my-hockey-network/domain';
import { PermissionControlKey } from '@my-hockey-network/contracts';
import { Spinner } from '@/components/common/Spinner';
import { FallbackImage } from '@/components/ui/fallback-image';
import { MoreHorizontal, Pencil, Trash2, EyeOff, Flag } from 'lucide-react';

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
  onAuthorClick?: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onNotInterestedClick?: () => void;
  onReportClick?: () => void;
}

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
  onAuthorClick,
  isMenuOpen,
  onToggleMenu,
  onEditClick,
  onDeleteClick,
  onNotInterestedClick,
  onReportClick,
}: Readonly<PostCardHeaderProps>) {
  return (
    <div className="mhn-post-header">
      <Button
        type="button"
        variant="unstyled"
        className="mhn-post-author-group"
        onClick={onAuthorClick}
        aria-label={`View ${authorName}'s profile`}
      >
        <div className="mhn-author-avatar-box">
          <FallbackImage
            src={authorAvatar}
            alt={authorName}
            fill
            sizes="48px"
            className="mhn-author-avatar-img"
          />
        </div>
        <div className="mhn-author-meta">
          <h4 className="mhn-author-name">{authorName}</h4>
          <span className="mhn-author-subtitle">
            {authorRole} • {authorTime}
          </span>
        </div>
      </Button>

      <div className="mhn-post-header-actions">
        {!isSelf && (
          <Button
            onClick={onToggleFollow}
            disabled={isFollowingLoading}
            className={`mhn-btn-follow ${isFollowing ? 'mhn-btn-following' : ''}`}
            title={!canFollow ? supervisionBlockedMessage(PermissionControlKey.FOLLOW_OTHERS) : undefined}
          >
            {isFollowingLoading ? (
              <Spinner size="sm" />
            ) : isFollowing ? (
              'Following'
            ) : (
              'Follow'
            )}
          </Button>
        )}

        <div className="mhn-post-menu-container">
          <Button
            onClick={onToggleMenu}
            className="mhn-btn-more-options"
            aria-label="More options"
          >
            <MoreHorizontal size={20} aria-hidden={true} />
          </Button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={onToggleMenu} />

              <div className="mhn-post-menu-popover absolute right-0 top-8 z-30 w-44 rounded-xl border border-[#182740] bg-[#0A1220] p-1.5 shadow-2xl flex flex-col gap-0.5">
                {isSelf ? (
                  <>
                    <Button
                      onClick={() => {
                        onToggleMenu();
                        onEditClick?.();
                      }}
                      className="mhn-post-menu-item flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 hover:bg-[#15243B] transition-colors"
                    >
                      <Pencil size={14} className="text-slate-400" aria-hidden={true} />
                      <span>Edit Post</span>
                    </Button>
                    <Button
                      onClick={() => {
                        onToggleMenu();
                        onDeleteClick?.();
                      }}
                      className="mhn-post-menu-item-danger flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={14} aria-hidden={true} />
                      <span>Delete Post</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        onToggleMenu();
                        onNotInterestedClick?.();
                      }}
                      className="mhn-post-menu-item flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 hover:bg-[#15243B] transition-colors"
                    >
                      <EyeOff size={14} className="text-slate-400" aria-hidden={true} />
                      <span>Not interested</span>
                    </Button>
                    <Button
                      onClick={() => {
                        onToggleMenu();
                        onReportClick?.();
                      }}
                      className="mhn-post-menu-item-danger flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Flag size={14} aria-hidden={true} />
                      <span>Report</span>
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
