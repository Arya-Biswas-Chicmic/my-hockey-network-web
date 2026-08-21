/**
 * Utility functions to resolve and normalize avatar and cover image URLs across the web application.
 */

export function resolveMediaUrl(url?: string | null, fallback: string = '/userPlaceholder.png'): string {
  if (!url || typeof url !== 'string' || !url.trim() || url === 'null' || url === 'undefined') return fallback;
  const trimmed = url.trim();

  // If URL uses backend localhost address (e.g. http://localhost:3000 or http://localhost:5175),
  // rewrite to use /v1 proxy so Vite routes it to backend with proper headers.
  if (trimmed.includes('localhost:3000') || trimmed.includes('localhost:5175')) {
    return trimmed.replace(/^https?:\/\/localhost:(3000|5175)(\/v1)?/, '/v1');
  }

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

  if (trimmed.includes('localhost:3000') || trimmed.includes('localhost:5175')) {
    return trimmed.replace(/^https?:\/\/localhost:(3000|5175)(\/v1)?/, '/v1');
  }

  return trimmed;
}
