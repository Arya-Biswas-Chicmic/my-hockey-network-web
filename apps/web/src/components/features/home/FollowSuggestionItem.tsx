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
    <div className="mhn-who-to-follow-row justify-between">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="mhn-who-to-follow-avatar">
          <FallbackImage src={user.avatar} alt={user.name} fill sizes="36px" className="mhn-avatar-img object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="mhn-who-to-follow-name block">
            {user.name}
          </span>
          {user.role && (
            <span className="block truncate text-xs text-muted-foreground">
              {user.role}
            </span>
          )}
        </div>
      </div>

      <Button
        disabled={isFollowing || isLoading}
        onClick={() => onFollow(user)}
        className="mhn-who-to-follow-btn"
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    </div>
  );
};
