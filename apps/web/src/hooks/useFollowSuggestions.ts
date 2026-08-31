import { useState } from 'react';
import { useWhoToFollow } from '@/hooks/use-who-to-follow';
import { FollowSuggestionUser } from '@/types/home.types';

export function useFollowSuggestions(fallbackSuggestions: FollowSuggestionUser[] = []) {
  const { people, isLoading, followedIds, followingId, handleFollow, canFollow } = useWhoToFollow();
  const [followedFallbackIds, setFollowedFallbackIds] = useState<Set<string>>(new Set());
  const isUsingFallback = people.length === 0 && fallbackSuggestions.length > 0;
  const visibleFollowedIds = isUsingFallback ? followedFallbackIds : followedIds;

  const suggestions: FollowSuggestionUser[] =
    people.length > 0
      ? people.map((person) => ({
          id: person.id,
          name: person.name,
          avatar: person.avatar,
          isFollowing: visibleFollowedIds.has(person.id),
        }))
      : fallbackSuggestions.map((person) => ({
          ...person,
          isFollowing: visibleFollowedIds.has(person.id),
        }));

  return {
    suggestions,
    isLoading: isLoading && !isUsingFallback,
    followedIds: visibleFollowedIds,
    followingId,
    canFollow,
    handleFollow: (user: FollowSuggestionUser) => {
      // The fallback path marks a suggestion followed locally without hitting
      // the API, so it has to honour the permission itself — otherwise a
      // restricted child could still flip the button to "Following".
      if (!canFollow) {
        return handleFollow({ id: user.id, name: user.name, avatar: user.avatar });
      }
      if (isUsingFallback) {
        setFollowedFallbackIds((current) => new Set(current).add(user.id));
        return;
      }
      return handleFollow({ id: user.id, name: user.name, avatar: user.avatar });
    },
  };
}
