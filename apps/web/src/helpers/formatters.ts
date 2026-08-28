import { parseISO, format, isValid } from 'date-fns';

/**
 * Compact K/M/B number display — feedback 2026-08-29: "Keep numbers in k, m,
 * b format... whether followers or anything, feed like or comments". One
 * shared formatter so follower counts and post like/comment/repost counts
 * don't each grow their own slightly-different rounding rule.
 */
export function formatCompactNumber(count: number): string {
  const sign = count < 0 ? '-' : '';
  const abs = Math.abs(count);
  if (abs < 1_000) return `${sign}${abs}`;

  const scale =
    abs >= 1_000_000_000 ? { divisor: 1_000_000_000, suffix: 'B' } :
    abs >= 1_000_000 ? { divisor: 1_000_000, suffix: 'M' } :
    { divisor: 1_000, suffix: 'K' };

  const scaled = abs / scale.divisor;
  const rounded = scaled >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
  return `${sign}${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}${scale.suffix}`;
}

export function formatDobToIso(dobStr: string | undefined): string | undefined {
  if (!dobStr) return undefined;
  const parts = dobStr.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  return dobStr;
}

export function formatIsoToDisplayDate(isoStr: string | undefined): string {
  if (!isoStr) return '-';
  try {
    const parsedDate = parseISO(isoStr);
    if (isValid(parsedDate)) {
      return format(parsedDate, 'MMM d, yyyy');
    }
    const d = new Date(isoStr);
    return isValid(d) ? format(d, 'MMM d, yyyy') : isoStr;
  } catch {
    return isoStr;
  }
}

export function formatRoleLabel(role: string): string {
  const upper = role.toUpperCase();
  switch (upper) {
    case 'PARENT':
      return 'Parent / Guardian';
    case 'PLAYER':
      return 'Player';
    case 'COACH':
      return 'Coach / Team Staff';
    case 'STAFF':
      return 'Staff';
    default:
      return role;
  }
}
