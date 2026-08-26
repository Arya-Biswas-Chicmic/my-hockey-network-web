import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/network/route-client';

export const metadata: Metadata = { title: 'My Network' };

export default function Page() {
  return <RouteClient />;
}
