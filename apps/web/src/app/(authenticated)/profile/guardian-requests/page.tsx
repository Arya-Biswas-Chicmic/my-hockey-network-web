import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/profile/guardian-requests/route-client';

export const metadata: Metadata = { title: 'Guardian Requests' };

export default function Page() {
  return <RouteClient />;
}
