'use client';

import { MessagingPage } from '@/screens/messaging-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <MessagingPage {...useAppNavigation()} />;
}
