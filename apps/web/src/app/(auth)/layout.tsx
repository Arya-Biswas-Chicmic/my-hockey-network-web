import type { ReactNode } from 'react';

import { ServerThemeBoundary } from '@/theme/server-theme-boundary';

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <ServerThemeBoundary>{children}</ServerThemeBoundary>;
}
