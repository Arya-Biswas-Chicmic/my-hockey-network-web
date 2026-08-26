'use client';

import { ProfileTabEnum } from '@my-hockey-network/contracts';

import { MinorPlayerGuard } from '@/components/routing/minor-player-guard';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import { ProfilePage } from '@/screens/profile-page';

export function RouteClient() {
  return (
    <MinorPlayerGuard>
      <ProfilePage {...useAppNavigation()} initialProfileTab={ProfileTabEnum.GUARDIAN_REQUESTS} />
    </MinorPlayerGuard>
  );
}
