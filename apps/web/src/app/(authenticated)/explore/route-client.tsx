'use client';

import { ExplorePage } from '@/screens/explore-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <ExplorePage {...useAppNavigation()} />;
}
