import React from 'react';
import { ROUTE_MAP, AppRoute } from '../config/routes';
import { useAppNavigation } from '../hooks/use-app-navigation';
import { RoleGuard } from '../guards/role-guard';

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

  const content = <ActiveComponent {...getScreenProps()} />;

  return (
    <div className="app-viewport">
      {routeDef.allowedRoles && routeDef.allowedRoles.length > 0 ? (
        <RoleGuard
          allowedRoles={routeDef.allowedRoles}
          redirectTo={AppRoute.HOME}
          onAccessDenied={(message) => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('mhn:toast', {
                  detail: {
                    message: message || 'Supervision access is available only to parent accounts.',
                    type: 'error',
                  },
                })
              );
            }
            navigate(AppRoute.HOME);
          }}
        >
          {content}
        </RoleGuard>
      ) : (
        content
      )}
    </div>
  );
};
