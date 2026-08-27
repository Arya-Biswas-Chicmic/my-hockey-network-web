export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_COOKIE_KEY = 'mhn_theme_preference';
export const RESOLVED_THEME_COOKIE_KEY = 'mhn_resolved_theme';

export function getStoredThemePreference(): ThemePreference {
  if (typeof localStorage === 'undefined') return 'dark';
  const storedTheme = localStorage.getItem(THEME_COOKIE_KEY);
  return storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
    ? storedTheme
    : 'dark';
}

export function setStoredThemePreference(theme: ThemePreference): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(THEME_COOKIE_KEY, theme);
}
