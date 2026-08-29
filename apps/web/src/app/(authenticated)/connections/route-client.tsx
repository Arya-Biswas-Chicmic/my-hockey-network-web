'use client';

import { ConnectionsPage } from '@/screens/connections-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <ConnectionsPage {...useAppNavigation()} />;
}
