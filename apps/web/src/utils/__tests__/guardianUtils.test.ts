import { describe, expect, it } from 'vitest';
import { GUARDIAN_RELATION_OPTIONS, formatDobInput, formatDobToIso } from '@/utils/guardianUtils';

describe('GUARDIAN_RELATION_OPTIONS', () => {
  it('covers the five backend-recognized relation values with a readable label each', () => {
    expect(GUARDIAN_RELATION_OPTIONS).toEqual([
      { value: 'MOTHER', label: 'Mother' },
      { value: 'FATHER', label: 'Father' },
      { value: 'LEGAL_GUARDIAN', label: 'Legal Guardian' },
      { value: 'GRANDPARENT', label: 'Grandparent' },
      { value: 'OTHER', label: 'Other' },
    ]);
  });
});

describe('formatDobInput', () => {
  it('inserts slashes as digits accumulate', () => {
    expect(formatDobInput('1')).toBe('1');
    expect(formatDobInput('10')).toBe('10');
    expect(formatDobInput('100')).toBe('10/0');
    expect(formatDobInput('1004')).toBe('10/04');
    expect(formatDobInput('10042010')).toBe('10/04/2010');
  });

  it('strips non-digit characters as they are typed', () => {
    expect(formatDobInput('10/04/2010')).toBe('10/04/2010');
    expect(formatDobInput('10-04-2010')).toBe('10/04/2010');
  });

  it('caps input at 8 digits, ignoring anything typed beyond that', () => {
    expect(formatDobInput('100420109999')).toBe('10/04/2010');
  });

  it('returns an empty string for empty input', () => {
    expect(formatDobInput('')).toBe('');
  });
});

describe('formatDobToIso', () => {
  it('converts DD/MM/YYYY to YYYY-MM-DD', () => {
    expect(formatDobToIso('10/04/2010')).toBe('2010-04-10');
  });

  it('pads single-digit day/month', () => {
    expect(formatDobToIso('5/4/2010')).toBe('2010-04-05');
  });

  it('passes through an already-ISO YYYY-MM-DD string unchanged', () => {
    expect(formatDobToIso('2010-04-10')).toBe('2010-04-10');
  });

  it('accepts dot or dash separated DD.MM.YYYY / DD-MM-YYYY input', () => {
    expect(formatDobToIso('10.04.2010')).toBe('2010-04-10');
    expect(formatDobToIso('10-04-2010')).toBe('2010-04-10');
  });

  it('detects YYYY-first separated input and reorders it to YYYY-MM-DD', () => {
    expect(formatDobToIso('2010/04/10')).toBe('2010-04-10');
  });

  it('returns undefined for empty or whitespace-only input', () => {
    expect(formatDobToIso('')).toBeUndefined();
    expect(formatDobToIso('   ')).toBeUndefined();
  });

  it('returns the trimmed input unchanged when it has no separators to split on', () => {
    expect(formatDobToIso(' notadate ')).toBe('notadate');
  });
});
