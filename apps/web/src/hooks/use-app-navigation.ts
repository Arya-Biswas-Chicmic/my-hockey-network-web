'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { AppRoute, ROUTE_MAP } from '@/config/routes';
import { paths } from '@/constants/paths';
import { useAuth } from '@/hooks/use-auth';

function resolvePath(route: AppRoute | string): string {
  if (route === 'login') return paths.auth.onboarding;
  return ROUTE_MAP[route as AppRoute]?.path ?? `/${String(route).replace(/^\//, '')}`;
}

export function useAppNavigation() {
  const router = useRouter();
  const { handleLogout } = useAuth();

  const onNavigate = useCallback(
    (route: AppRoute | string, extraData?: Record<string, unknown>) => {
      const target = new URL(resolvePath(route), window.location.origin);
      const possibleUserId = extraData?.userId ?? extraData?.selectedWardId ?? extraData?.childId;
      if (typeof possibleUserId === 'string' && possibleUserId) {
        target.searchParams.set('userId', possibleUserId);
      }
      const connectionTab = extraData?.connectionTab;
      if (route === AppRoute.NETWORK && (connectionTab === 'following' || connectionTab === 'followers')) {
        // The standalone Connections page (feedback 2026-08-29) is now the
        // real destination for this — `/network?view=connections` still
        // works (My Network's own menu can still reach it) but followers/
        // following clicks go straight to the dedicated page + sidebar item.
        const connectionsTarget = new URL(resolvePath(AppRoute.CONNECTIONS), window.location.origin);
        connectionsTarget.searchParams.set('tab', connectionTab);
        router.push(`${connectionsTarget.pathname}${connectionsTarget.search}`);
        return;
      }
      router.push(`${target.pathname}${target.search}`);
    },
    [router],
  );

  const onLogout = useCallback(async () => {
    await handleLogout();
    router.replace(paths.auth.onboarding);
  }, [handleLogout, router]);

  return useMemo(() => ({ onNavigate, onLogout }), [onLogout, onNavigate]);
}
