import { formatDisplayName, formatUserAvatar, formatRoleTag } from '../formatters/userFormatters';
import { formatCareerPeriod } from '../formatters/dateFormatters';

export interface FormattedCareerEntry {
  id: string;
  teamName: string;
  position: string;
  location: string;
  periodLabel: string;
  note?: string;
  isCurrentPlaying: boolean;
}

export interface ProfileViewModel {
  displayName: string;
  avatarUrl: string;
  coverUrl: string;
  roleTag: string;
  city: string;
  bio: string;
  isPlayer: boolean;
  careerEntries: FormattedCareerEntry[];
}

export function createProfileViewModel(user: any): ProfileViewModel {
  const prof = user?.profile || user;
  const displayName = formatDisplayName(prof?.displayName, prof?.firstName, prof?.lastName);
  const avatarUrl = formatUserAvatar(prof?.avatarUrl);
  const coverUrl = formatUserAvatar(prof?.coverUrl, '/cover.png');
  const roleTag = formatRoleTag(user?.primaryRole || prof?.type, prof?.position, prof?.jerseyNumber);
  const city = prof?.city || 'Location not set';
  const bio = prof?.bio || 'No bio provided yet.';
  const primaryRole = (user?.primaryRole || prof?.type || 'PLAYER').toString().toUpperCase();
  const isPlayer = primaryRole === 'PLAYER';

  const rawCareer = user?.career || prof?.career || [];
  const careerEntries: FormattedCareerEntry[] = Array.isArray(rawCareer)
    ? rawCareer.map((c: any, idx: number) => ({
        id: c.id || `career_${idx}`,
        teamName: c.teamName || 'Team',
        position: c.position || 'Player',
        location: c.location || 'Location',
        periodLabel: formatCareerPeriod(c.startMonth, c.startYear, c.endMonth, c.endYear, c.isCurrentPlaying),
        note: c.note || undefined,
        isCurrentPlaying: Boolean(c.isCurrentPlaying),
      }))
    : [];

  return {
    displayName,
    avatarUrl,
    coverUrl,
    roleTag,
    city,
    bio,
    isPlayer,
    careerEntries,
  };
}
