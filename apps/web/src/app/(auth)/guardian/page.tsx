import type { Metadata } from 'next';

import { RouteClient } from '@/app/(auth)/guardian/route-client';

export const metadata: Metadata = { title: 'Guardian Approval' };

export default function Page() {
  return <RouteClient />;
}
