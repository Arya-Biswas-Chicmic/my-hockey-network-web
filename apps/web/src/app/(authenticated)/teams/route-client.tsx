'use client';

import { TeamsPage } from '@/screens/teams-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <TeamsPage {...useAppNavigation()} />;
}
