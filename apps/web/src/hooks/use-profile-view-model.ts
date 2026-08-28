import { resolveMediaUrl, resolveCoverUrl } from '@/utils/mediaUtils';
import type { CareerEntry } from '@my-hockey-network/core';
import type { AuthMeResponse } from '@my-hockey-network/contracts';

/**
 * Pure data-transformation layer for the Profile screen: normalizes the raw
 * `/profiles/:id` response (or the authenticated user's own profile, when
 * viewing self) into the flat display fields every profile tab/card
 * consumes. Extracted from `screens/profile-page.tsx` — no state, no API
 * calls, just derivation, so it's safe to unit test independent of the
 * screen's data fetching.
 */
export function useProfileViewModel(
  targetProfileRes: unknown,
  user: AuthMeResponse | null | undefined,
  isOwnProfile: boolean,
  careerEntries: CareerEntry[] | null,
) {
  const targetResObj = (targetProfileRes || {}) as Record<string, unknown>;
  const targetDataObj = (targetResObj.data || {}) as Record<string, unknown>;
  const rawTargetProfile = (targetResObj.profile || targetDataObj.profile || targetProfileRes) as Record<string, unknown> | null;
  const activeProfile = rawTargetProfile?.id || rawTargetProfile?.profileId || rawTargetProfile?.displayName ? rawTargetProfile : (isOwnProfile ? user?.profile : null);
  const rawProf = (activeProfile || {}) as Record<string, unknown>;

  const liveName = String(rawProf.displayName || rawProf.name || 'Player');
  const rawAvatar = rawProf.avatarUrl as string | undefined;
  const liveAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.webp');
  const rawCover =
    (rawProf.coverImageUrl as string | undefined) ||
    (rawProf.coverUrl as string | undefined) ||
    (rawProf.coverImageKey as string | undefined);
  const liveCoverImage = resolveCoverUrl(rawCover, '/cover.webp');
  const rawRole =
    rawProf.primaryRole ||
    rawProf.profileType ||
    rawProf.type ||
    (isOwnProfile ? user?.primaryRole : null) ||
    rawProf.roleTag ||
    'PLAYER';
  const liveRole = String(rawProf.roleTag || rawRole);
  const liveRoleUpper = String(rawRole).toUpperCase();
  const isPlayer = liveRoleUpper === 'PLAYER' || liveRoleUpper.includes('PLAYER') || liveRoleUpper.includes('CENTER') || liveRoleUpper.includes('WING') || liveRoleUpper.includes('DEFENSE') || liveRoleUpper.includes('GOALTENDER');
  const isCoach = liveRoleUpper === 'COACH' || liveRoleUpper.includes('COACH');
  const isParent = liveRoleUpper === 'PARENT' || liveRoleUpper.includes('PARENT');
  const canHaveCareer = isPlayer || isCoach || (!isParent && liveRoleUpper !== 'PARENT');

  // Live profile field fallbacks
  const liveBio = String(rawProf.bio || '');
  const livePosition = String(rawProf.position || 'Center');
  const liveJersey = rawProf.jerseyNumber !== null && rawProf.jerseyNumber !== undefined ? String(rawProf.jerseyNumber) : '';
  const liveCity = String(rawProf.city || rawProf.location || '');
  const rawDob =
    rawProf.dateOfBirth ||
    rawProf.dob ||
    rawProf.date_of_birth ||
    (isOwnProfile ? user?.profile?.dateOfBirth : null);
  const liveDob = rawDob ? (String(rawDob).includes('T') ? String(rawDob).split('T')[0] : String(rawDob)) : '';
  const liveGender = String(rawProf.genderCategory || rawProf.gender || 'Male');

  const roleSubtitle = (() => {
    const targetProf = targetProfileRes as { profile?: { career?: { teamName?: string }[]; careerEntries?: { teamName?: string }[]; teamName?: string } } | null;
    const primaryTeam = (careerEntries && careerEntries.length > 0 && careerEntries[0]?.teamName)
      ? careerEntries[0].teamName
      : (targetProf?.profile?.career?.[0]?.teamName ||
        targetProf?.profile?.careerEntries?.[0]?.teamName ||
        targetProf?.profile?.teamName ||
        user?.profile?.career?.[0]?.teamName ||
        user?.profile?.careerEntries?.[0]?.teamName ||
        user?.profile?.teamName || null);
    if (isParent) return liveRole;
    const teamString = primaryTeam ? ` • @${primaryTeam}` : '';
    if (isPlayer) {
      const positionAbbreviations: Record<string, string> = {
        'Left Wing': 'LW',
        'Right Wing': 'RW',
        Center: 'C',
        Defense: 'D',
        Goaltender: 'G',
      };
      const position = livePosition ? positionAbbreviations[livePosition] || livePosition : liveRole;
      const jersey = liveJersey ? ` • #${liveJersey}` : '';
      return `${position}${jersey}${teamString}`;
    }
    return `${liveRole}${teamString}`;
  })();

  return {
    activeProfile,
    liveName,
    liveAvatar,
    liveCoverImage,
    liveRole,
    isPlayer,
    isCoach,
    isParent,
    canHaveCareer,
    liveBio,
    livePosition,
    liveJersey,
    liveCity,
    liveDob,
    liveGender,
    roleSubtitle,
  };
}
