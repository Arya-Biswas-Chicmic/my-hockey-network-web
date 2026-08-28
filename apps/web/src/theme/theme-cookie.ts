export const THEME_COOKIE_KEY = 'mhn_theme_preference';
export const RESOLVED_THEME_COOKIE_KEY = 'mhn_resolved_theme';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_PREFERENCES: ReadonlySet<string> = new Set<ThemePreference>([
  'light',
  'dark',
  'system',
]);
const RESOLVED_THEMES: ReadonlySet<string> = new Set<ResolvedTheme>(['light', 'dark']);

export function isThemePreference(value: string | undefined): value is ThemePreference {
  return value !== undefined && THEME_PREFERENCES.has(value);
}

export function isResolvedTheme(value: string | undefined): value is ResolvedTheme {
  return value !== undefined && RESOLVED_THEMES.has(value);
}

/**
 * Mirrors next-themes' own client-only state into cookies so the server can
 * render the same `<html>` class/style on the next request instead of
 * always guessing "light" — that guess is what causes a class/style
 * hydration mismatch (next-themes' pre-hydration script would then correct
 * it client-side, diverging from the SSR markup).
 */
export function persistThemeCookies(theme: ThemePreference, resolvedTheme: ResolvedTheme) {
  if (globalThis.document === undefined) {
    return;
  }

  globalThis.document.cookie = `${THEME_COOKIE_KEY}=${theme}; path=/; max-age=31536000; samesite=lax`;
  globalThis.document.cookie = `${RESOLVED_THEME_COOKIE_KEY}=${resolvedTheme}; path=/; max-age=31536000; samesite=lax`;
}
