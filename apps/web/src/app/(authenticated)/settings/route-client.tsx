'use client';

import { SettingsPage } from '@/screens/settings-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <SettingsPage {...useAppNavigation()} />;
}
