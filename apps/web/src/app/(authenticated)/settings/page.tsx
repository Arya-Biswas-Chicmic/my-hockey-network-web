import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/settings/route-client';

export const metadata: Metadata = { title: 'Settings' };

export default function Page() {
  return <RouteClient />;
}
