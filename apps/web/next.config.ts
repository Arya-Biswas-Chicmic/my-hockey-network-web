import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // Uploaded avatars/covers/post media resolve to signed storage URLs on a
    // backend-controlled host that varies per environment; there is no fixed
    // domain list to enumerate. See docs/DATA_FETCHING_AND_AUTH.md and
    // packages/core/src/api/mediaApi.ts for the upload flow this serves.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  transpilePackages: [
    '@my-hockey-network/api-client',
    '@my-hockey-network/auth',
    '@my-hockey-network/constants',
    '@my-hockey-network/contracts',
    '@my-hockey-network/core',
    '@my-hockey-network/design-system',
    '@my-hockey-network/design-tokens',
    '@my-hockey-network/domain',
    '@my-hockey-network/shared',
    '@my-hockey-network/types',
    '@my-hockey-network/utils',
    '@my-hockey-network/validation',
  ],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
