import type { ReactNode } from 'react';

import { AuthenticatedGuard } from '@/components/routing/authenticated-guard';
import { AuthenticatedShell } from '@/app/(authenticated)/authenticated-shell';

export const dynamic = 'force-dynamic';

export default function AuthenticatedLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthenticatedGuard>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </AuthenticatedGuard>
  );
}
