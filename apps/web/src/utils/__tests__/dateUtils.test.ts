import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatRelativeTime } from '@/utils/dateUtils';

const NOW = new Date('2026-08-27T12:00:00.000Z');

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for missing input', () => {
    expect(formatRelativeTime(undefined)).toBe('Just now');
  });

  it('returns "Just now" for a timestamp under a minute old', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() - 30_000).toISOString())).toBe('Just now');
  });

  it('formats minutes for a timestamp under an hour old', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() - 5 * 60_000).toISOString())).toBe('5m');
  });

  it('formats hours for a timestamp under a day old', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() - 3 * 60 * 60_000).toISOString())).toBe('3h');
  });

  it('formats days for a timestamp under a week old', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() - 2 * 24 * 60 * 60_000).toISOString())).toBe('2d');
  });

  it('falls back to a short date once older than a week', () => {
    const eightDaysAgo = new Date(NOW.getTime() - 8 * 24 * 60 * 60_000);
    expect(formatRelativeTime(eightDaysAgo.toISOString())).toBe(
      eightDaysAgo.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    );
  });

  it('falls through to the JS "Invalid Date" string for an unparseable timestamp (no throw to catch)', () => {
    // `new Date('not-a-date')` doesn't throw — it's a valid Date object
    // whose getTime() is NaN, so every diff comparison is false and this
    // falls through to the final toLocaleDateString() branch, which
    // stringifies as "Invalid Date" rather than throwing into the catch's
    // 'Recently' fallback (that fallback exists for a genuinely throwing
    // input, which no real caller in this codebase produces today).
    expect(formatRelativeTime('not-a-date')).toBe('Invalid Date');
  });
});
