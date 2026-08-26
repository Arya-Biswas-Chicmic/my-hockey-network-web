import type { Metadata } from 'next';

import { RouteClient } from '@/app/(auth)/onboarding/route-client';

export const metadata: Metadata = { title: 'Sign In' };

export default function Page() {
  return <RouteClient />;
}
