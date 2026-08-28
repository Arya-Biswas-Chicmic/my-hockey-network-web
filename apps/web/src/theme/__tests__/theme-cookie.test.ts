// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';

import {
  DEFAULT_RESOLVED_THEME,
  DEFAULT_THEME,
  getStoredThemePreference,
  parseResolvedTheme,
  parseThemePreference,
  persistTheme,
  RESOLVED_THEME_COOKIE_KEY,
  THEME_COOKIE_KEY,
} from '@/theme/theme-cookie';

describe('theme cookie helpers', () => {
  beforeEach(() => {
    document.cookie = `${THEME_COOKIE_KEY}=; Max-Age=0; Path=/`;
    document.cookie = `${RESOLVED_THEME_COOKIE_KEY}=; Max-Age=0; Path=/`;
  });

  it('uses safe defaults for missing or invalid values', () => {
    expect(parseThemePreference(undefined)).toBe(DEFAULT_THEME);
    expect(parseThemePreference('invalid')).toBe(DEFAULT_THEME);
    expect(parseResolvedTheme(undefined)).toBe(DEFAULT_RESOLVED_THEME);
    expect(parseResolvedTheme('system')).toBe(DEFAULT_RESOLVED_THEME);
  });

  it.each(['light', 'dark', 'system'] as const)('accepts the %s preference', (theme) => {
    expect(parseThemePreference(theme)).toBe(theme);
  });

  it('persists both preference and resolved theme for server rendering', () => {
    persistTheme('system', 'light');

    expect(getStoredThemePreference()).toBe('system');
    expect(document.cookie).toContain(`${THEME_COOKIE_KEY}=system`);
    expect(document.cookie).toContain(`${RESOLVED_THEME_COOKIE_KEY}=light`);
  });
});
