import type { ReactNode } from 'react';

import { AuthenticatedGuard } from '@/components/routing/authenticated-guard';
import { ServerThemeBoundary } from '@/theme/server-theme-boundary';

export const dynamic = 'force-dynamic';

export default function AuthenticatedLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ServerThemeBoundary>
      <AuthenticatedGuard>{children}</AuthenticatedGuard>
    </ServerThemeBoundary>
  );
}
