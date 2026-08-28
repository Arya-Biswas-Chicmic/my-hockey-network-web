export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_COOKIE_KEY = 'mhn_theme_preference';
export const RESOLVED_THEME_COOKIE_KEY = 'mhn_resolved_theme';
export const DEFAULT_THEME: ThemePreference = 'dark';
export const DEFAULT_RESOLVED_THEME: ResolvedTheme = 'dark';

const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function parseThemePreference(value: string | null | undefined): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : DEFAULT_THEME;
}

export function parseResolvedTheme(value: string | null | undefined): ResolvedTheme {
  return value === 'light' || value === 'dark' ? value : DEFAULT_RESOLVED_THEME;
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const prefix = `${encodeURIComponent(name)}=`;
  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);
}

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function getStoredThemePreference(): ThemePreference {
  return parseThemePreference(readCookie(THEME_COOKIE_KEY));
}

export function persistTheme(theme: ThemePreference, resolvedTheme: ResolvedTheme): void {
  writeCookie(THEME_COOKIE_KEY, theme);
  writeCookie(RESOLVED_THEME_COOKIE_KEY, resolvedTheme);
}
