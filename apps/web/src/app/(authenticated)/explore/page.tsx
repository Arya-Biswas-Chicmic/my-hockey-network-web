import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/explore/route-client';

export const metadata: Metadata = { title: 'Explore' };

export default function Page() {
  return <RouteClient />;
}
