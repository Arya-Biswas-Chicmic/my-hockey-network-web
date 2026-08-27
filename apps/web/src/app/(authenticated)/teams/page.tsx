import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/teams/route-client';

export const metadata: Metadata = { title: 'Teams' };

export default function Page() {
  return <RouteClient />;
}
