import React from 'react';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';
import { FollowSuggestionUser } from '@/types/home.types';

export interface FollowSuggestionItemProps {
  user: FollowSuggestionUser;
  onFollow: (user: FollowSuggestionUser) => void;
  isFollowing?: boolean;
  isLoading?: boolean;
}

export const FollowSuggestionItem: React.FC<FollowSuggestionItemProps> = ({
  user,
  onFollow,
  isFollowing = false,
  isLoading = false,
}) => {
  return (
    <div className="mhn-who-to-follow-row flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="mhn-who-to-follow-avatar relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-800">
          <FallbackImage src={user.avatar} alt={user.name} fill className="mhn-avatar-img object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="mhn-who-to-follow-name block truncate text-sm font-semibold text-slate-100">
            {user.name}
          </span>
          {user.role && (
            <span className="block truncate text-xs text-slate-400">
              {user.role}
            </span>
          )}
        </div>
      </div>

      <Button
        disabled={isFollowing || isLoading}
        onClick={() => onFollow(user)}
        className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
          isFollowing
            ? 'bg-[#0D1A30] text-white border border-[#152238] cursor-default shadow-sm'
            : 'bg-[#07101E] text-[#168BFF] border border-[#168BFF] hover:bg-[#168BFF]/10'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    </div>
  );
};
