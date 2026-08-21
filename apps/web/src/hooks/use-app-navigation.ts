import { useState, useEffect, useCallback } from 'react';
import { AppRoute, ROUTE_MAP, getRouteFromPath } from '../config/routes';
import { hasActiveToken } from '../services/auth-session';
import { useAuth } from './use-auth';

export interface UseAppNavigationReturn {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  logout: () => void;
  handleOnboardingComplete: () => void;
}

export function useAppNavigation(): UseAppNavigationReturn {
  const { user } = useAuth();

  const getUserRole = useCallback(() => {
    return (
      user?.primaryRole ||
      (user as any)?.profile?.type ||
      (user as any)?.profile?.primaryRole ||
      'PLAYER'
    ).toUpperCase();
  }, [user]);

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (!hasActiveToken()) {
      return AppRoute.ONBOARDING;
    }
    return getRouteFromPath(typeof window !== 'undefined' ? window.location.pathname : '/');
  });

  const navigate = useCallback(
    (targetRoute: AppRoute) => {
      const routeDef = ROUTE_MAP[targetRoute];
      const isAuthRequired = routeDef ? routeDef.isProtected : true;

      if (isAuthRequired && !hasActiveToken()) {
        setCurrentRoute(AppRoute.ONBOARDING);
        if (window.location.pathname !== ROUTE_MAP[AppRoute.ONBOARDING].path) {
          window.history.pushState({}, '', ROUTE_MAP[AppRoute.ONBOARDING].path);
        }
        return;
      }

      // Strict Role Guard Check
      if (routeDef?.allowedRoles && routeDef.allowedRoles.length > 0) {
        const currentUserRole = getUserRole();
        const isAllowed = routeDef.allowedRoles.some(
          (role) => role.toUpperCase() === currentUserRole
        );

        if (!isAllowed) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('mhn:toast', {
                detail: {
                  message: 'Supervision access is available only to parent accounts.',
                  type: 'error',
                },
              })
            );
          }
          // Redirect safely to HOME
          setCurrentRoute(AppRoute.HOME);
          if (window.location.pathname !== ROUTE_MAP[AppRoute.HOME].path) {
            window.history.pushState({}, '', ROUTE_MAP[AppRoute.HOME].path);
          }
          return;
        }
      }

      setCurrentRoute(targetRoute);
      const targetPath = routeDef ? routeDef.path : '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    },
    [getUserRole]
  );

  const logout = useCallback(() => {
    setCurrentRoute(AppRoute.ONBOARDING);
    if (window.location.pathname !== ROUTE_MAP[AppRoute.ONBOARDING].path) {
      window.history.pushState({}, '', ROUTE_MAP[AppRoute.ONBOARDING].path);
    }
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    navigate(AppRoute.HOME);
  }, [navigate]);

  useEffect(() => {
    // Keep URL in sync with initial load screen and enforce role guard on direct URL entry
    if (hasActiveToken()) {
      const initialRoute = getRouteFromPath(window.location.pathname);
      const routeDef = ROUTE_MAP[initialRoute];

      if (routeDef?.allowedRoles && routeDef.allowedRoles.length > 0) {
        const currentUserRole = getUserRole();
        const isAllowed = routeDef.allowedRoles.some(
          (role) => role.toUpperCase() === currentUserRole
        );

        if (!isAllowed) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('mhn:toast', {
                detail: {
                  message: 'Supervision access is available only to parent accounts.',
                  type: 'error',
                },
              })
            );
          }
          setCurrentRoute(AppRoute.HOME);
          window.history.replaceState({}, '', ROUTE_MAP[AppRoute.HOME].path);
          return;
        }
      }

      const targetPath = routeDef.path;
      if (window.location.pathname !== targetPath) {
        window.history.replaceState({}, '', targetPath);
      }
    } else {
      if (
        window.location.pathname !== ROUTE_MAP[AppRoute.ONBOARDING].path &&
        window.location.pathname !== ROUTE_MAP[AppRoute.HOME].path
      ) {
        window.history.replaceState({}, '', ROUTE_MAP[AppRoute.ONBOARDING].path);
      }
    }

    // Sync browser back/forward history navigation
    const handlePopState = () => {
      if (!hasActiveToken()) {
        setCurrentRoute(AppRoute.ONBOARDING);
        return;
      }
      const targetRoute = getRouteFromPath(window.location.pathname);
      const routeDef = ROUTE_MAP[targetRoute];

      if (routeDef?.allowedRoles && routeDef.allowedRoles.length > 0) {
        const currentUserRole = getUserRole();
        const isAllowed = routeDef.allowedRoles.some(
          (role) => role.toUpperCase() === currentUserRole
        );

        if (!isAllowed) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('mhn:toast', {
                detail: {
                  message: 'Supervision access is available only to parent accounts.',
                  type: 'error',
                },
              })
            );
          }
          setCurrentRoute(AppRoute.HOME);
          window.history.replaceState({}, '', ROUTE_MAP[AppRoute.HOME].path);
          return;
        }
      }

      setCurrentRoute(targetRoute);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [getUserRole]);

  return {
    currentRoute,
    navigate,
    logout,
    handleOnboardingComplete,
  };
}
