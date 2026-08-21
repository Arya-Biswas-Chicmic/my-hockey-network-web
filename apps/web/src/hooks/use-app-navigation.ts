import { useState, useEffect, useCallback } from 'react';
import { AppRoute, ROUTE_MAP, getRouteFromPath } from '../config/routes';
import { hasActiveToken } from '../services/auth-session';

export interface UseAppNavigationReturn {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  logout: () => void;
  handleOnboardingComplete: () => void;
}

export function useAppNavigation(): UseAppNavigationReturn {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (!hasActiveToken()) {
      return AppRoute.ONBOARDING;
    }
    return getRouteFromPath(typeof window !== 'undefined' ? window.location.pathname : '/');
  });

  const navigate = useCallback((targetRoute: AppRoute) => {
    const routeDef = ROUTE_MAP[targetRoute];
    const isAuthRequired = routeDef ? routeDef.isProtected : true;

    if (isAuthRequired && !hasActiveToken()) {
      setCurrentRoute(AppRoute.ONBOARDING);
      if (window.location.pathname !== ROUTE_MAP[AppRoute.ONBOARDING].path) {
        window.history.pushState({}, '', ROUTE_MAP[AppRoute.ONBOARDING].path);
      }
      return;
    }

    setCurrentRoute(targetRoute);
    const targetPath = routeDef ? routeDef.path : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, []);

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
    // Keep URL in sync with initial load screen
    if (hasActiveToken()) {
      const initialRoute = getRouteFromPath(window.location.pathname);
      const targetPath = ROUTE_MAP[initialRoute].path;
      if (window.location.pathname !== targetPath) {
        window.history.replaceState({}, '', targetPath);
      }
    } else {
      if (window.location.pathname !== ROUTE_MAP[AppRoute.ONBOARDING].path && window.location.pathname !== ROUTE_MAP[AppRoute.HOME].path) {
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
      setCurrentRoute(targetRoute);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return {
    currentRoute,
    navigate,
    logout,
    handleOnboardingComplete,
  };
}
