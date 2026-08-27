'use client';

import { SavedPage } from '@/screens/saved-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <SavedPage {...useAppNavigation()} />;
}
