// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';

import {
  isResolvedTheme,
  isThemePreference,
  persistThemeCookies,
  RESOLVED_THEME_COOKIE_KEY,
  THEME_COOKIE_KEY,
} from '@/theme/theme-cookie';

describe('theme cookie helpers', () => {
  beforeEach(() => {
    document.cookie = `${THEME_COOKIE_KEY}=; Max-Age=0; Path=/`;
    document.cookie = `${RESOLVED_THEME_COOKIE_KEY}=; Max-Age=0; Path=/`;
  });

  it('rejects missing or invalid values', () => {
    expect(isThemePreference(undefined)).toBe(false);
    expect(isThemePreference('invalid')).toBe(false);
    expect(isResolvedTheme(undefined)).toBe(false);
    expect(isResolvedTheme('system')).toBe(false);
  });

  it.each(['light', 'dark', 'system'] as const)('accepts the %s preference', (theme) => {
    expect(isThemePreference(theme)).toBe(true);
  });

  it.each(['light', 'dark'] as const)('accepts the %s resolved theme', (theme) => {
    expect(isResolvedTheme(theme)).toBe(true);
  });

  it('persists both preference and resolved theme for server rendering', () => {
    persistThemeCookies('system', 'light');

    expect(document.cookie).toContain(`${THEME_COOKIE_KEY}=system`);
    expect(document.cookie).toContain(`${RESOLVED_THEME_COOKIE_KEY}=light`);
  });
});
