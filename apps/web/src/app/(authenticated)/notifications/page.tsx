import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/notifications/route-client';

export const metadata: Metadata = { title: 'Notifications' };

export default function Page() {
  return <RouteClient />;
}
