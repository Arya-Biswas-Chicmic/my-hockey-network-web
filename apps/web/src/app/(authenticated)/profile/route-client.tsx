'use client';

import { ProfilePage } from '@/screens/profile-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <ProfilePage {...useAppNavigation()} />;
}
