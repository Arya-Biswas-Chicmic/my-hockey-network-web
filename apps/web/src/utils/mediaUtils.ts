/**
 * Utility functions to resolve and normalize avatar and cover image URLs across the web application.
 */

/**
 * `next.config.js`'s `images.remotePatterns` only allows `https://` remote
 * hosts (a deliberate security choice — see the comment there — not
 * something to loosen). A relative path (`/userPlaceholder.png`, an
 * uploaded-media path proxied through this app) is always fine; an
 * absolute URL must be `https://` or Next's `<Image>` throws synchronously
 * at render time and takes the whole page down with it — this isn't a
 * hypothetical, a real account's stale `http://localhost:3000/...` avatar
 * URL (left over from local dev media-storage testing) did exactly that.
 */
export function isRenderableImageUrl(url: string): boolean {
  if (url.startsWith('/')) return true;
  return url.toLowerCase().startsWith('https://');
}

export function resolveMediaUrl(url?: string | null, fallback: string = '/userPlaceholder.png'): string {
  if (!url || typeof url !== 'string' || !url.trim() || url === 'null' || url === 'undefined') return fallback;
  const trimmed = url.trim();
  if (!isRenderableImageUrl(trimmed)) return fallback;

  return trimmed;
}

export function resolveCoverUrl(url?: string | null, fallback: string = '/cover.png'): string {
  if (
    !url ||
    typeof url !== 'string' ||
    !url.trim() ||
    url === 'null' ||
    url === 'undefined' ||
    url.toLowerCase().includes('placeholder')
  ) {
    return fallback;
  }
  const trimmed = url.trim();
  if (!isRenderableImageUrl(trimmed)) return fallback;

  return trimmed;
}
