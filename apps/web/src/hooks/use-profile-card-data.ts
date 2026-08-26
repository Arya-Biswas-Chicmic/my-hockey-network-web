import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@/query';
import { resolveCoverUrl, resolveMediaUrl } from '@/utils/mediaUtils';
import { getProfile } from '@my-hockey-network/core';
import { QueryKeys } from '@my-hockey-network/contracts';

interface ProfileCardFallbacks {
  name?: string;
  role?: string;
  avatarUrl?: string;
  coverUrl?: string;
  location?: string;
  teamName?: string;
  followers?: string | number;
  following?: string | number;
}

export function useProfileCardData(fallbacks: ProfileCardFallbacks) {
  const { user } = useAuth();
  const profileId = user?.profile?.id || user?.id;
  const { data: profileResponse } = useQuery(
    profileId ? `${QueryKeys.USER_PROFILE}:${profileId}` : null,
    profileId ? () => getProfile(profileId) : null,
    { staleTime: 30_000 },
  );
  const apiProfile = profileResponse?.profile;
  const authProfile = user?.profile;
  const role = fallbacks.role || user?.primaryRole || apiProfile?.type || authProfile?.type || 'PLAYER';
  const careerEntries = apiProfile?.careerEntries || apiProfile?.career || authProfile?.careerEntries || authProfile?.career || [];
  const careerTeam = careerEntries.find((entry) => entry.teamName)?.teamName;
  const profileTeam =
    apiProfile?.teamName || apiProfile?.team || apiProfile?.academyName || apiProfile?.currentTeam ||
    authProfile?.teamName || authProfile?.team || authProfile?.academyName || authProfile?.currentTeam;

  return {
    name: apiProfile?.displayName || authProfile?.displayName || fallbacks.name || 'Player',
    role,
    avatar: resolveMediaUrl(apiProfile?.avatarUrl || authProfile?.avatarUrl || fallbacks.avatarUrl, '/userPlaceholder.png'),
    cover: resolveCoverUrl(
      apiProfile?.coverImageUrl || apiProfile?.coverUrl || apiProfile?.coverImageKey ||
      authProfile?.coverImageUrl || authProfile?.coverUrl || authProfile?.coverImageKey || fallbacks.coverUrl,
      '/cover.png',
    ),
    location: apiProfile?.city || apiProfile?.location || authProfile?.city || authProfile?.location || fallbacks.location || '-',
    teamName: String(role).toUpperCase() === 'PARENT' ? undefined : careerTeam || profileTeam || fallbacks.teamName,
    followers: user?.counts?.followers ?? fallbacks.followers ?? 0,
    following: user?.counts?.following ?? fallbacks.following ?? 0,
  };
}
