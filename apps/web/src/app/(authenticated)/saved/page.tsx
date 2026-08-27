import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/saved/route-client';

export const metadata: Metadata = { title: 'Saved' };

export default function Page() {
  return <RouteClient />;
}
