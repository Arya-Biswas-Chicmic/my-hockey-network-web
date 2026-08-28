import { useWhoToFollow } from '@/hooks/use-who-to-follow';
import { FollowSuggestionUser } from '@/types/home.types';

const FALLBACK_SUGGESTIONS: FollowSuggestionUser[] = [
  { id: 'suggest-1', name: 'Connor McDavid', avatar: '/player.webp' },
  { id: 'suggest-2', name: 'Sidney Crosby', avatar: '/player.webp' },
  { id: 'suggest-3', name: 'Alex Ovechkin', avatar: '/player.webp' },
  { id: 'suggest-4', name: 'Nathan MacKinnon', avatar: '/player.webp' },
  { id: 'suggest-5', name: 'Auston Matthews', avatar: '/player.webp' },
];

export function useFollowSuggestions() {
  const { people, isLoading, followedIds, followingId, handleFollow } = useWhoToFollow();

  const suggestions: FollowSuggestionUser[] =
    people.length > 0
      ? people.map((person) => ({
          id: person.id,
          name: person.name,
          avatar: person.avatar,
          isFollowing: followedIds.has(person.id),
        }))
      : FALLBACK_SUGGESTIONS.map((person) => ({
          ...person,
          isFollowing: followedIds.has(person.id),
        }));

  return {
    suggestions,
    isLoading,
    followedIds,
    followingId,
    handleFollow: (user: FollowSuggestionUser) =>
      handleFollow({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      }),
  };
}
