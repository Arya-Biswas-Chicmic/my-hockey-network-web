import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { FallbackImage } from '@/components/ui/fallback-image';
import { LockKeyhole, MoreHorizontal, Pencil, Trash2, EyeOff, Flag } from 'lucide-react';

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
  isMenuOpen,
  onToggleMenu,
  onEditClick,
  onDeleteClick,
  onNotInterestedClick,
  onReportClick,
}: Readonly<PostCardHeaderProps>) {
  return (
    <div className="mhn-post-header flex items-center justify-between p-4">
      <div className="mhn-post-author-group flex items-center gap-3">
        <div className="mhn-author-avatar-box relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-800">
          <FallbackImage
            src={authorAvatar}
            alt={authorName}
            fill
            className="mhn-author-avatar-img object-cover"
          />
        </div>
        <div className="mhn-author-meta flex flex-col">
          <h4 className="mhn-author-name text-sm font-bold text-slate-100 leading-tight">{authorName}</h4>
          <span className="mhn-author-subtitle text-xs text-slate-400">
            {authorRole} • {authorTime}
          </span>
        </div>
      </div>

      <div className="mhn-post-header-actions flex items-center gap-2">
        {!isSelf && (
          <Button
            onClick={onToggleFollow}
            disabled={isFollowingLoading}
            className={`mhn-btn-follow rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              isFollowing
                ? 'bg-[#0D1A30] text-white border border-[#152238] shadow-sm'
                : 'bg-[#07101E] text-[#168BFF] border border-[#168BFF] hover:bg-[#168BFF]/10'
            } ${isFollowingLoading ? 'opacity-50 cursor-wait' : ''}`}
            title={!canFollow ? 'Parent did not give permission' : undefined}
          >
            {!canFollow ? (
              <span className="flex items-center gap-1">
                <LockKeyhole size={12} aria-hidden={true} />
                Follow
              </span>
            ) : isFollowingLoading ? (
              <Spinner size="sm" color={isFollowing ? '#FFFFFF' : '#168BFF'} />
            ) : isFollowing ? (
              'Following'
            ) : (
              'Follow'
            )}
          </Button>
        )}

        <div className="relative">
          <Button
            onClick={onToggleMenu}
            className="mhn-btn-more-options p-1.5 text-slate-400 hover:text-slate-200"
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

