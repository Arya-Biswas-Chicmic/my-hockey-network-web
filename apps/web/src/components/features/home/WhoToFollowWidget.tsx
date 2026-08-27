import React from 'react';
import { Button } from '@/components/common/Button';
import { useFollowSuggestions } from '@/hooks/useFollowSuggestions';
import { FollowSuggestionItem } from '@/components/features/home/FollowSuggestionItem';

export interface WhoToFollowWidgetProps {
  onViewAll?: () => void;
}

export function WhoToFollowWidget({ onViewAll }: Readonly<WhoToFollowWidgetProps>) {
  const { suggestions, isLoading, followedIds, followingId, handleFollow } = useFollowSuggestions();

  return (
    <div className="mhn-sidebar-card mhn-who-to-follow-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm mb-4">
      <div className="mhn-sidebar-card-header flex items-center justify-between mb-3">
        <h3 className="mhn-sidebar-card-title text-sm font-bold text-slate-100">Who to follow</h3>
        {onViewAll && (
          <Button
            onClick={onViewAll}
            className="mhn-sidebar-view-all text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All
          </Button>
        )}
      </div>

      <div className="mhn-who-to-follow-list flex flex-col gap-1">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="mhn-who-to-follow-row flex items-center gap-3 py-2 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-slate-800" />
              <div className="h-4 w-28 rounded bg-slate-800" />
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
            />
          ))
        )}
      </div>
    </div>
  );
}
