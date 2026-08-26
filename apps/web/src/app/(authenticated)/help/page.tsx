import type { Metadata } from 'next';

import { RouteClient } from '@/app/(authenticated)/help/route-client';

export const metadata: Metadata = { title: 'Help & Support' };

export default function Page() {
  return <RouteClient />;
}
