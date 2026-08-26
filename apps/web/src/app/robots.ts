import type { MetadataRoute } from 'next';

// The root URL redirects to sign-in. Only explicit public entity pages are
// crawlable; authenticated and authentication-transition routes stay private.
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/players/'],
        disallow: ['/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
