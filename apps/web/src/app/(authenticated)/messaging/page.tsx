import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/messaging/route-client';

export const metadata: Metadata = { title: 'Messaging' };

export default function Page() {
  return <RouteClient />;
}
