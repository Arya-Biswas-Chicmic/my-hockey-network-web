'use client';

import { HelpPage } from '@/screens/help-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <HelpPage {...useAppNavigation()} />;
}
