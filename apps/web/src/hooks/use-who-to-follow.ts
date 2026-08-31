'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPeopleYouMayKnow, followUser, type RecommendedPerson } from '@my-hockey-network/core';
import { PermissionControlKey, QueryKeys } from '@my-hockey-network/contracts';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { useAuth } from '@/hooks/use-auth';
import { ERROR_MESSAGES } from '@my-hockey-network/constants';
import { supervisionBlockedMessage } from '@my-hockey-network/domain';

export interface WhoToFollowPerson {
  id: string;
  name: string;
  avatar: string;
}

function mapPerson(item: RecommendedPerson, index: number): WhoToFollowPerson {
  const prof = item.profile || item;
  return {
    id: prof.id || prof.profileId || `who-to-follow-${index}`,
    name: prof.displayName || prof.name || 'Player',
    avatar: resolveMediaUrl(prof.avatarUrl, '/userPlaceholder.webp'),
  };
}

/** Home sidebar's "Who to follow" widget: a short list of people-you-may-know
 * recommendations, reusing the same `/recommendations/people` endpoint
 * `screens/my-network-page.tsx` already uses for its full list. */
export function useWhoToFollow(limit = 5) {
  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.PEOPLE_YOU_MAY_KNOW, 'sidebar', limit],
    queryFn: () => getPeopleYouMayKnow({ limit }),
    staleTime: 5 * 60 * 1000,
  });

  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [followingId, setFollowingId] = useState<string | null>(null);

  const people = (data?.items ?? []).map(mapPerson);

  const { checkSupervisionPermission, showToast } = useAuth();
  const canFollow = checkSupervisionPermission(PermissionControlKey.FOLLOW_OTHERS);
  const assertFollowAllowed = () => {
    if (canFollow) return true;
    showToast(supervisionBlockedMessage(PermissionControlKey.FOLLOW_OTHERS), 'error');
    return false;
  };

  const handleFollow = async (person: WhoToFollowPerson) => {
    if (followingId) return;
    // Gated here rather than at each call site so every "Who to follow"
    // surface is covered by one check — the post card's follow button was
    // previously the only follow action a guardian could actually restrict.
    if (!assertFollowAllowed()) return;
    setFollowingId(person.id);
    try {
      const res = await followUser({ type: 'PROFILE', id: person.id });
      setFollowedIds((prev) => new Set(prev).add(person.id));
      showSuccessToast(res?.pendingGuardianApproval ? `Follow requested for ${person.name}` : `You are now following ${person.name}`);
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_FOLLOW);
    } finally {
      setFollowingId(null);
    }
  };

  return { people, isLoading, followedIds, followingId, handleFollow, canFollow };
}
