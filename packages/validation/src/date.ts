import { differenceInYears, isValid, parse } from 'date-fns';

/**
 * The two date-of-birth string formats this project accepts.
 *
 * - `DD/MM/YYYY` is what the manual text/masked DOB inputs produce (signup's
 *   create-account step, the parent "Add Player" flow).
 * - `YYYY-MM-DD` is what a native `<input type="date">` produces (Profile >
 *   About > Personal Details, Edit Profile).
 *
 * Before this module existed there were four separate hand-rolled parsers
 * spread across `forms.ts`, `profileValidation.ts`, and `core/signUpRules.ts`,
 * each accepting a slightly different set of inputs and two of them computing
 * age without a birthday-boundary adjustment. Everything now routes here.
 */
export type DobFormat = 'DD/MM/YYYY' | 'YYYY-MM-DD';

const DATE_FNS_PATTERN: Record<DobFormat, string> = {
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
};

const SHAPE_PATTERN: Record<DobFormat, RegExp> = {
  'DD/MM/YYYY': /^\d{1,2}\/\d{1,2}\/\d{4}$/,
  'YYYY-MM-DD': /^\d{4}-\d{1,2}-\d{1,2}$/,
};

/** Earliest year accepted for a date of birth, matching the previous parsers. */
const MIN_DOB_YEAR = 1900;

/**
 * Parses a date-of-birth string in one of the accepted formats, or every
 * accepted format when none is specified.
 *
 * Strict: the value must match the format's shape exactly and denote a real
 * calendar date. `date-fns`'s `parse` rejects overflow (31/02/2010 does not
 * silently roll into March) and, unlike `new Date(value)`, never falls back to
 * the engine's implementation-defined parsing — so `'2010'` and `'05/13/2010'`
 * are rejected rather than quietly reinterpreted.
 *
 * The returned Date is in the local timezone (`parse` builds it from local
 * calendar fields), which is what the age comparison below wants: a birthday is
 * a calendar date, not an instant.
 */
export function parseDob(value: string, format?: DobFormat): Date | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const formats: DobFormat[] = format ? [format] : ['DD/MM/YYYY', 'YYYY-MM-DD'];

  for (const candidate of formats) {
    if (!SHAPE_PATTERN[candidate].test(trimmed)) continue;
    const parsed = parse(trimmed, DATE_FNS_PATTERN[candidate], new Date());
    if (!isValid(parsed)) continue;
    if (parsed.getFullYear() < MIN_DOB_YEAR) return null;
    return parsed;
  }

  return null;
}

/**
 * Whole years elapsed from `birthDate` to `now`, adjusted for whether this
 * year's birthday has already passed.
 *
 * `differenceInYears` handles that boundary (and leap days) correctly, which the
 * previous `today.getFullYear() - dob.getFullYear()` implementations did not:
 * that arithmetic reported someone born 2021-12-01 as 5 years old throughout
 * 2026, letting a 4-year-old past a `age < 5` minimum-age gate.
 *
 * Returns a negative number for a date more than a year in the future, but note
 * that it truncates toward zero — a date a few months ahead yields `0`, not a
 * negative number. Use `isFutureDate` to detect a future date; do not test the
 * sign of this result.
 */
export function ageFromDate(birthDate: Date, now: Date = new Date()): number {
  return differenceInYears(now, birthDate);
}

/**
 * Whether `date` is after `now`.
 *
 * Exists because `ageFromDate` truncates toward zero, so `age < 0` does not
 * reliably detect a future date: a DOB six months from today produces an age of
 * `0`, which would otherwise sail through as a newborn.
 */
export function isFutureDate(date: Date, now: Date = new Date()): boolean {
  return date.getTime() > now.getTime();
}

/**
 * Convenience wrapper: parse then age in one step. Returns `null` when the
 * value is not a valid date in an accepted format.
 */
export function ageFromDob(value: string, format?: DobFormat, now: Date = new Date()): number | null {
  const parsed = parseDob(value, format);
  return parsed ? ageFromDate(parsed, now) : null;
}
