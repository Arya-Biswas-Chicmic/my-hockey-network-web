import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/groups/route-client';

export const metadata: Metadata = { title: 'Groups' };

export default function Page() {
  return <RouteClient />;
}
