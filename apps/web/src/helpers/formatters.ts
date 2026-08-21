import { parseISO, format, isValid } from 'date-fns';

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
