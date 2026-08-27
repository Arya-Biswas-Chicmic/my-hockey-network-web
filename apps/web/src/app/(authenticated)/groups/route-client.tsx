'use client';

import { GroupsPage } from '@/screens/groups-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <GroupsPage {...useAppNavigation()} />;
}
