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
            className={`mhn-btn-follow rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
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

          {isSelf && isMenuOpen && (
            <div className="mhn-post-menu-popover absolute right-0 top-8 z-30 w-36 rounded-xl border border-slate-800 bg-slate-900 p-1 shadow-xl">
              <Button onClick={onEditClick} className="mhn-post-menu-item flex w-full items-center gap-2 rounded-lg p-2 text-xs text-slate-200 hover:bg-slate-800">
                <Pencil size={14} aria-hidden={true} />
                <span>Edit Post</span>
              </Button>
              <Button onClick={onDeleteClick} className="mhn-post-menu-item-danger flex w-full items-center gap-2 rounded-lg p-2 text-xs text-rose-400 hover:bg-rose-500/10">
                <Trash2 size={14} aria-hidden={true} />
                <span>Delete Post</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
