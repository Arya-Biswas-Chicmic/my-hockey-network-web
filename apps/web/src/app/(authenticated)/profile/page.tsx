import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/profile/route-client';

export const metadata: Metadata = { title: 'Profile' };

export default function Page() {
  return <RouteClient />;
}
