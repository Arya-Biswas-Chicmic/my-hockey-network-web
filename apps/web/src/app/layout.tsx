import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import '@/index.css';
import { Providers } from '@/theme/providers';

function getSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  try {
    return new URL(raw.startsWith('http') ? raw : `https://${raw}`);
  } catch {
    return new URL('http://localhost:3000');
  }
}

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: 'My Hockey Network',
    template: '%s | My Hockey Network',
  },
  description: 'Connect with the hockey community, teams, events, and opportunities.',
  robots: { index: false, follow: false },
};


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
