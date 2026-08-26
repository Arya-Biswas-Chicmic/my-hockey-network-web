'use client';

import { ParentRoleGuard } from '@/components/routing/parent-role-guard';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import { SupervisionPage } from '@/screens/supervision-page';

export function RouteClient() {
  return <ParentRoleGuard><SupervisionPage {...useAppNavigation()} /></ParentRoleGuard>;
}
