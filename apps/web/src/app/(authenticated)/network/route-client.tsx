'use client';

import { MyNetworkPage } from '@/screens/my-network-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  return <MyNetworkPage {...useAppNavigation()} />;
}
