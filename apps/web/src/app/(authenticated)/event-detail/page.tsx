import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/event-detail/route-client';

export const metadata: Metadata = { title: 'Event Details' };

export default function Page() {
  return <RouteClient />;
}
