import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import '@/index.css';
import { Providers } from '@/theme/providers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
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
