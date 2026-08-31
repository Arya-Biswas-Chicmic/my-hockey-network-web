import { resolveMediaUrl, resolveCoverUrl } from '@/utils/mediaUtils';
import { getLocalAvatar } from '@/utils/local-avatar-storage';
import type { CareerEntry } from '@my-hockey-network/core';
import type { AuthMeResponse } from '@my-hockey-network/contracts';

export function calculateAge(dateOfBirth: string, today = new Date()): number | null {
  const dobDate = new Date(dateOfBirth);
  if (!dateOfBirth || Number.isNaN(dobDate.getTime())) return null;
  let years = today.getFullYear() - dobDate.getFullYear();
  const hasHadBirthday = today.getMonth() > dobDate.getMonth()
    || (today.getMonth() === dobDate.getMonth() && today.getDate() >= dobDate.getDate());
  if (!hasHadBirthday) years -= 1;
  return years;
}

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
  fallbackProfile: Record<string, unknown>,
) {
  const targetResObj = (targetProfileRes || {}) as Record<string, unknown>;
  const targetDataObj = (targetResObj.data || {}) as Record<string, unknown>;
  const rawTargetProfile = (targetResObj.profile || targetDataObj.profile || targetProfileRes) as Record<string, unknown> | null;
  const activeProfile = rawTargetProfile?.id || rawTargetProfile?.profileId || rawTargetProfile?.displayName ? rawTargetProfile : (isOwnProfile ? user?.profile : null);
  const rawProf = (activeProfile || {}) as Record<string, unknown>;
  // A genuinely-fetched profile (even one with lots of unset optional fields, like a
  // brand-new account) must never be padded out with `fallbackProfile`'s demo values —
  // that would silently present fabricated position/DOB/height/etc. as the user's real
  // data, and would get submitted back to the backend as real if Edit Profile is saved
  // untouched (docs/DEMO_DATA_POLICY.md). The demo fallback is only for the case where
  // there is no real profile to show at all.
  const hasRealProfile = Boolean(rawProf.id || rawProf.profileId || rawProf.displayName);
  const valueFor = (...keys: string[]): unknown => {
    for (const source of hasRealProfile ? [rawProf] : [rawProf, fallbackProfile]) {
      for (const key of keys) {
        const value = source[key];
        if (value !== null && value !== undefined && value !== '') return value;
      }
    }
    return undefined;
  };
  const resolvedProfile = hasRealProfile ? rawProf : { ...fallbackProfile, ...rawProf };

  const liveName = String(valueFor('displayName', 'name') || 'Player');
  const rawAvatar = valueFor('avatarUrl') as string | undefined;
  // Own profile prefers the local-first photo cache over whatever the
  // backend returned (feedback 2026-08-29 — see
  // `@/utils/local-avatar-storage`). This hook's own `activeProfile` comes
  // from a separate `getProfile()` fetch, not the auth-context `user` that
  // already carries this override, so it needs its own lookup here too.
  const ownProfileId = String(rawProf.id || rawProf.profileId || '');
  const localAvatar = isOwnProfile ? getLocalAvatar(ownProfileId) : null;
  const liveAvatar = resolveMediaUrl(localAvatar || rawAvatar, '/userPlaceholder.webp');
  const rawCover =
    (valueFor('coverImageUrl', 'coverUrl', 'coverImageKey') as string | undefined);
  const liveCoverImage = resolveCoverUrl(rawCover, '/cover.webp');
  const rawRole =
    valueFor('primaryRole', 'profileType', 'type') ||
    (isOwnProfile ? user?.primaryRole : null) ||
    valueFor('roleTag') ||
    'PLAYER';
  const liveRole = String(valueFor('roleTag') || rawRole);
  const liveRoleUpper = String(rawRole).toUpperCase();
  const isPlayer = liveRoleUpper === 'PLAYER' || liveRoleUpper.includes('PLAYER') || liveRoleUpper.includes('CENTER') || liveRoleUpper.includes('WING') || liveRoleUpper.includes('DEFENSE') || liveRoleUpper.includes('GOALTENDER');
  const isCoach = liveRoleUpper === 'COACH' || liveRoleUpper.includes('COACH');
  const isParent = liveRoleUpper === 'PARENT' || liveRoleUpper.includes('PARENT');
  const canHaveCareer = isPlayer || isCoach || (!isParent && liveRoleUpper !== 'PARENT');

  // Live profile field fallbacks
  const liveBio = String(valueFor('bio') || '');
  const livePosition = String(valueFor('position') || '');
  const jerseyNumber = valueFor('jerseyNumber');
  const liveJersey = jerseyNumber !== null && jerseyNumber !== undefined ? String(jerseyNumber) : '';
  const liveCity = String(valueFor('city', 'location') || '');
  const rawDob =
    valueFor('dateOfBirth', 'dob', 'date_of_birth') ||
    (isOwnProfile ? user?.profile?.dateOfBirth : null);
  const liveDob = rawDob ? (String(rawDob).includes('T') ? String(rawDob).split('T')[0] : String(rawDob)) : '';
  const liveGender = String(valueFor('genderCategory', 'gender') || '');

  // `ProfileReadResponse.profile.age` is computed server-side when present;
  // otherwise derive it client-side from DOB rather than showing nothing.
  const rawAge = valueFor('age');
  const liveAge = typeof rawAge === 'number' ? rawAge : calculateAge(liveDob);

  // `shootsCatches` only exists on the authenticated user's own
  // `AuthMeResponse.profile` shape today — `ProfileReadResponse` (returned
  // by `getProfile` for viewing someone else) has no such field, so this is
  // honestly `null` rather than guessed when viewing another profile.
  const liveShoots = isOwnProfile
    ? (valueFor('shootsCatches') as string | undefined) || (user?.profile?.shootsCatches as string | undefined) || null
    : (valueFor('shootsCatches') as string | undefined) || null;
  const liveHeight = String(valueFor('height') || '—');
  const liveWeight = String(valueFor('weight') || '—');
  const followers = Number(valueFor('followers') || 0);
  const following = Number(valueFor('following') || 0);

  const roleSubtitle = (() => {
    const targetProf = targetProfileRes as { profile?: { career?: { teamName?: string }[]; careerEntries?: { teamName?: string }[]; teamName?: string } } | null;
    const primaryTeam = (careerEntries && careerEntries.length > 0 && careerEntries[0]?.teamName)
      ? careerEntries[0].teamName
      : (targetProf?.profile?.career?.[0]?.teamName ||
        targetProf?.profile?.careerEntries?.[0]?.teamName ||
        targetProf?.profile?.teamName ||
        user?.profile?.career?.[0]?.teamName ||
        user?.profile?.careerEntries?.[0]?.teamName ||
        user?.profile?.teamName ||
        valueFor('teamName') || null);
    if (isParent) return liveRole;
    const teamString = primaryTeam ? ` • @${primaryTeam}` : '';
    if (isPlayer) {
      const positionAbbreviations: Record<string, string> = {
        'left wing': 'LW',
        'right wing': 'RW',
        'center': 'C',
        'defense': 'D',
        'goaltender': 'G',
      };
      const normalizedKey = livePosition.toLowerCase();
      const position = livePosition ? positionAbbreviations[normalizedKey] || livePosition : liveRole;
      const jersey = liveJersey ? ` • #${liveJersey}` : '';
      return `${position}${jersey}${teamString}`;
    }
    return `${liveRole}${teamString}`;
  })();

  return {
    activeProfile: resolvedProfile,
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
    liveAge,
    liveShoots,
    liveHeight,
    liveWeight,
    followers,
    following,
    roleSubtitle,
  };
}
