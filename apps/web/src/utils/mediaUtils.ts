/**
 * Utility functions to resolve and normalize avatar and cover image URLs across the web application.
 */

export function resolveMediaUrl(url?: string | null, fallback: string = '/userPlaceholder.png'): string {
  if (!url || typeof url !== 'string' || !url.trim() || url === 'null' || url === 'undefined') return fallback;
  const trimmed = url.trim();

  return trimmed;
}

export function resolveCoverUrl(url?: string | null, fallback: string = '/cover.png'): string {
  if (
    !url ||
    typeof url !== 'string' ||
    !url.trim() ||
    url === 'null' ||
    url === 'undefined' ||
    url.includes('placeholder')
  ) {
    return fallback;
  }
  const trimmed = url.trim();

  return trimmed;
}
