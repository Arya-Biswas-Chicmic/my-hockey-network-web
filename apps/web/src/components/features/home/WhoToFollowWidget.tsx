import React from 'react';
import { Button } from '@/components/common/Button';
import { useFollowSuggestions } from '@/hooks/useFollowSuggestions';
import { FollowSuggestionItem } from '@/components/features/home/FollowSuggestionItem';
import type { FollowSuggestionUser } from '@/types/home.types';

export interface WhoToFollowWidgetProps {
  onViewAll?: () => void;
  fallbackSuggestions?: FollowSuggestionUser[];
}

export function WhoToFollowWidget({ onViewAll, fallbackSuggestions }: Readonly<WhoToFollowWidgetProps>) {
  const { suggestions, isLoading, followedIds, followingId, handleFollow, canFollow } = useFollowSuggestions(fallbackSuggestions);

  return (
    <div className="mhn-sidebar-card mhn-who-to-follow-card">
      <div className="mhn-sidebar-card-header">
        <h3 className="mhn-sidebar-card-title">Who to follow</h3>
        {onViewAll && (
          <Button
            onClick={onViewAll}
            className="mhn-sidebar-view-all"
          >
            View All
          </Button>
        )}
      </div>

      <div className="mhn-who-to-follow-list">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="mhn-who-to-follow-row animate-pulse">
              <div className="size-9 rounded-full bg-muted" />
              <div className="h-4 w-28 rounded bg-muted" />
            </div>
          ))
        ) : (
          suggestions.map((person) => (
            <FollowSuggestionItem
              key={person.id}
              user={person}
              isFollowing={followedIds.has(person.id)}
              isLoading={followingId === person.id}
              onFollow={handleFollow}
              canFollow={canFollow}
            />
          ))
        )}
      </div>
    </div>
  );
}
