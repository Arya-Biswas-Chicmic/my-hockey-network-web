import type { ReactNode } from 'react';

import { AuthenticatedGuard } from '@/components/routing/authenticated-guard';

export const dynamic = 'force-dynamic';

export default function AuthenticatedLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AuthenticatedGuard>{children}</AuthenticatedGuard>;
}
