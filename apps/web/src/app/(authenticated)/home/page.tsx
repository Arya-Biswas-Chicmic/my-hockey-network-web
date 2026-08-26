import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/home/route-client';

export const metadata: Metadata = { title: 'Home' };

export default function Page() {
  return <RouteClient />;
}
