import React from 'react';
import { ROUTE_MAP, AppRoute } from '../config/routes';
import { useAppNavigation } from '../hooks/use-app-navigation';

export const AppRouter: React.FC = () => {
  const { currentRoute, navigate, logout, handleOnboardingComplete } = useAppNavigation();

  const routeDef = ROUTE_MAP[currentRoute] || ROUTE_MAP[AppRoute.HOME];
  const ActiveComponent = routeDef.component;

  // Compute props cleanly per screen requirements using AppRoute enum
  const getScreenProps = () => {
    switch (currentRoute) {
      case AppRoute.ONBOARDING:
        return { onComplete: handleOnboardingComplete };
      case AppRoute.GUARDIAN:
        return {
          onSendSuccess: () => navigate(AppRoute.SENT),
          onSignOut: logout,
        };
      case AppRoute.SENT:
        return { onComplete: () => navigate(AppRoute.HOME) };
      case AppRoute.EVENT_DETAIL:
        return {
          onNavigate: navigate,
          onLogout: logout,
          onBack: () => navigate(AppRoute.PROFILE),
        };
      default:
        return {
          onNavigate: navigate,
          onLogout: logout,
        };
    }
  };

  return (
    <div className="app-viewport">
      <ActiveComponent {...getScreenProps()} />
    </div>
  );
};
