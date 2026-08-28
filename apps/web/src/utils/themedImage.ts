export type ThemeMode = 'light' | 'dark';

/**
 * Resolves the root-relative `/public` path for a themed static image pair.
 *
 * Theme-variant images live under `apps/web/public/light/` and
 * `apps/web/public/dark/`, sharing one basename across both folders (e.g.
 * `light/onboarding-welcome.webp` + `dark/onboarding-welcome.webp`) so the
 * pairing is visible from the filename alone. Only images that actually
 * differ by theme belong here — everything else (logos, avatars, event
 * photos, icons) stays directly under `public/` and is theme-independent.
 * See docs/COMPONENT_CATALOG.md → "Static asset location and format".
 *
 * @param name  Shared basename, no extension (e.g. `'onboarding-welcome'`).
 * @param theme Resolved theme — pass `resolvedTheme` from `useTheme()`, not
 *              the raw `theme` setting (which may be `'system'`).
 */
export function themedImageSrc(name: string, theme: ThemeMode): string {
  return `/${theme}/${name}.webp`;
}
