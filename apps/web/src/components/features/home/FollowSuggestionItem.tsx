import React from 'react';
import { supervisionBlockedMessage } from '@my-hockey-network/domain';
import { PermissionControlKey } from '@my-hockey-network/contracts';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';
import { FollowSuggestionUser } from '@/types/home.types';
import { useProfileClickHandler } from '@/hooks/use-profile-click';

export interface FollowSuggestionItemProps {
  user: FollowSuggestionUser;
  onFollow: (user: FollowSuggestionUser) => void;
  /** Whether a guardian permits following. Blocked follows explain on click. */
  canFollow?: boolean;
  isFollowing?: boolean;
  isLoading?: boolean;
}

export const FollowSuggestionItem: React.FC<FollowSuggestionItemProps> = ({
  user,
  onFollow,
  canFollow = true,
  isFollowing = false,
  isLoading = false,
}) => {
  const handleProfileClick = useProfileClickHandler();

  return (
    <div className="mhn-who-to-follow-row justify-between">
      <Button
        type="button"
        variant="unstyled"
        className="flex min-w-0 items-center gap-2.5"
        onClick={() => handleProfileClick({ id: user.id, name: user.name, avatar: user.avatar, roleTag: user.role })}
        aria-label={`View ${user.name}'s profile`}
      >
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
      </Button>

      <Button
        disabled={isFollowing || isLoading}
        onClick={() => onFollow(user)}
        className={`mhn-who-to-follow-btn ${!canFollow ? 'mhn-action-item-blocked' : ''}`}
        title={!canFollow ? supervisionBlockedMessage(PermissionControlKey.FOLLOW_OTHERS) : undefined}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    </div>
  );
};
