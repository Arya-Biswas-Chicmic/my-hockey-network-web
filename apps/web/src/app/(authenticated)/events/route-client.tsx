'use client';

import { EventsPage } from '@/screens/events-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <EventsPage {...useAppNavigation()} />;
}
