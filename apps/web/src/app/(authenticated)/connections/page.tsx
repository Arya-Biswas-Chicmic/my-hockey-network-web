import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/connections/route-client';

export const metadata: Metadata = { title: 'Connections' };

export default function Page() {
  return <RouteClient />;
}
