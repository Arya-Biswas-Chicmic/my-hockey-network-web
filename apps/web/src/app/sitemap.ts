import type { MetadataRoute } from 'next';

// There is no public landing page. Public profile URLs are unbounded and
// cannot be enumerated until the backend exposes a public-profile index.
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
