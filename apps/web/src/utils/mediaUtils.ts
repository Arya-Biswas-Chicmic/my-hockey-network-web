/**
 * Utility functions to resolve and normalize avatar and cover image URLs across the web application.
 */

/**
 * `next.config.js`'s `images.remotePatterns` only allows `https://` remote
 * hosts (a deliberate security choice — see the comment there — not
 * something to loosen). A relative path (`/userPlaceholder.webp`, an
 * uploaded-media path proxied through this app) is always fine; an
 * absolute URL must be `https://` or Next's `<Image>` throws synchronously
 * at render time and takes the whole page down with it — this isn't a
 * hypothetical, a real account's stale `http://localhost:3000/...` avatar
 * URL (left over from local dev media-storage testing) did exactly that.
 *
 * `data:image/...` is also allowed — that's the local-first avatar cache's
 * own format (`@/utils/local-avatar-storage`, feedback 2026-08-29), and
 * Next's `<Image>` already renders a data URL unoptimized (no loader, no
 * `remotePatterns` check applies) rather than passing it through the
 * `/_next/image` proxy, so this doesn't reopen the risk the check above
 * guards against.
 */
export function isRenderableImageUrl(url: string): boolean {
  if (url.startsWith('/')) return true;
  if (url.toLowerCase().startsWith('data:image/')) return true;
  return url.toLowerCase().startsWith('https://');
}

export function resolveMediaUrl(url?: string | null, fallback: string = '/userPlaceholder.webp'): string {
  if (!url || typeof url !== 'string' || !url.trim() || url === 'null' || url === 'undefined') return fallback;
  const trimmed = url.trim();
  if (!isRenderableImageUrl(trimmed)) return fallback;

  return trimmed;
}

export function resolveCoverUrl(url?: string | null, fallback: string = '/cover.webp'): string {
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
