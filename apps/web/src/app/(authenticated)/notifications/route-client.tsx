'use client';

import { NotificationsPage } from '@/screens/notifications-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <NotificationsPage {...useAppNavigation()} />;
}
