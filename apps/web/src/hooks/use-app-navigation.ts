'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { ROUTE_MAP, type AppRoute } from '@/config/routes';
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
