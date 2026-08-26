'use client';

import { HomePage } from '@/screens/home-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <HomePage {...useAppNavigation()} />;
}
