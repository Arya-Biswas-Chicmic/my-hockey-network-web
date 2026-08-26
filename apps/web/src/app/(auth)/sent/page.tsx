import type { Metadata } from 'next';

import { RouteClient } from '@/app/(auth)/sent/route-client';

export const metadata: Metadata = { title: 'Request Sent' };

export default function Page() {
  return <RouteClient />;
}
