import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/supervision/route-client';

export const metadata: Metadata = { title: 'Supervision' };

export default function Page() {
  return <RouteClient />;
}
