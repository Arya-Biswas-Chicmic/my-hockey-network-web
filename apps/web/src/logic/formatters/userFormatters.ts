import { resolveMediaUrl } from '../../utils/mediaUtils';

export function formatDisplayName(
  displayName?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  fallback = 'Anonymous Athlete'
): string {
  if (displayName && displayName.trim()) {
    return displayName.trim();
  }
  const full = `${firstName || ''} ${lastName || ''}`.trim();
  if (full) {
    return full;
  }
  return fallback;
}

export function formatUserAvatar(avatarUrl?: string | null, fallback = '/userPlaceholder.png'): string {
  return resolveMediaUrl(avatarUrl, fallback);
}

export function formatRoleTag(role?: string | null, position?: string | null, jerseyNumber?: string | number | null): string {
  if (position) {
    const jerseyStr = jerseyNumber !== null && jerseyNumber !== undefined && String(jerseyNumber).trim() !== ''
      ? ` • #${jerseyNumber}`
      : '';
    return `${position}${jerseyStr}`;
  }
  if (!role) return 'PLAYER';
  const str = String(role).trim().toUpperCase();
  if (str === 'PARENT') return 'Parent / Guardian';
  if (str === 'COACH') return 'Head Coach';
  if (str === 'STAFF') return 'Team Staff';
  return str;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}
