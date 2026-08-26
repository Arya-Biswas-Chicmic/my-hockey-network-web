import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/events/route-client';

export const metadata: Metadata = { title: 'Events' };

export default function Page() {
  return <RouteClient />;
}
