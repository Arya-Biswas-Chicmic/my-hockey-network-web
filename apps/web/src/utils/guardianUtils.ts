export type GuardianRelationType = 'MOTHER' | 'FATHER' | 'LEGAL_GUARDIAN' | 'GRANDPARENT' | 'OTHER';

export interface GuardianRelationOption {
  value: GuardianRelationType;
  label: string;
}

export const GUARDIAN_RELATION_OPTIONS: GuardianRelationOption[] = [
  { value: 'MOTHER', label: 'Mother' },
  { value: 'FATHER', label: 'Father' },
  { value: 'LEGAL_GUARDIAN', label: 'Legal Guardian' },
  { value: 'GRANDPARENT', label: 'Grandparent' },
  { value: 'OTHER', label: 'Other' },
];

/**
 * Auto-format raw typing digits (e.g. 10042010 -> 10/04/2010)
 */
export const formatDobInput = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

/**
 * Standard utility function to normalize date of birth strings (DD/MM/YYYY or YYYY-MM-DD)
 * to valid backend ISO format YYYY-MM-DD.
 */
export const formatDobToIso = (dobStr: string): string | undefined => {
  if (!dobStr) return undefined;
  const trimmed = dobStr.trim();
  if (!trimmed) return undefined;

  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const [yyyy, mm, dd] = parts;
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    const [dd, mm, yyyy] = parts;
    if (yyyy && yyyy.length === 4) {
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
};
