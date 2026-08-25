import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppRoute, ROUTE_MAP } from '../config/routes';
import { UserRole } from '../enums/role';
import { AuthGuard } from '../guards/auth-guard';
import { GuestGuard } from '../guards/guest-guard';
import { RoleGuard } from '../guards/role-guard';
import {
  EventDetailPage,
  EventsPage,
  GuardianApprovalPage,
  HelpPage,
  HomePage,
  MessagingPage,
  MyNetworkPage,
  NotificationsPage,
  OnboardingPage,
  ProfilePage,
  RequestSentPage,
  SettingsPage,
  SupervisionPage,
} from '../pages';
import { useAuth } from '../hooks/use-auth';

function RouteTree() {
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const navigateTo = (route: AppRoute | string, extraData?: any) => {
    const definition = ROUTE_MAP[route as AppRoute];
    let targetPath = definition?.path ?? `/${String(route).replace(/^\//, '')}`;
    const targetUserId = extraData?.userId || extraData?.selectedWardId || extraData?.childId;
    if (targetUserId) {
      targetPath = `${targetPath}?userId=${encodeURIComponent(targetUserId)}`;
    }
    navigate(targetPath, { state: extraData });
  };
  const logout = async () => {
    await handleLogout();
    navigate(ROUTE_MAP[AppRoute.ONBOARDING].path, { replace: true });
  };
  const pageProps = { onNavigate: navigateTo, onLogout: logout };

  return (
    <div className="app-viewport">
      <Routes>
        <Route element={<GuestGuard />}>
          <Route
            path={ROUTE_MAP[AppRoute.ONBOARDING].path}
            element={<OnboardingPage onComplete={() => navigateTo(AppRoute.HOME)} />}
          />
        </Route>

        <Route element={<AuthGuard />}>
          <Route path={ROUTE_MAP[AppRoute.HOME].path} element={<HomePage {...pageProps} />} />
          <Route path={ROUTE_MAP[AppRoute.NETWORK].path} element={<MyNetworkPage {...pageProps} />} />
          <Route path={ROUTE_MAP[AppRoute.EVENTS].path} element={<EventsPage {...pageProps} />} />
          <Route path={ROUTE_MAP[AppRoute.MESSAGING].path} element={<MessagingPage {...pageProps} />} />
          <Route path={ROUTE_MAP[AppRoute.NOTIFICATIONS].path} element={<NotificationsPage {...pageProps} />} />
          <Route path={ROUTE_MAP[AppRoute.PROFILE].path} element={<ProfilePage {...pageProps} />} />
          <Route path={ROUTE_MAP[AppRoute.SETTINGS].path} element={<SettingsPage {...pageProps} />} />
          <Route path={ROUTE_MAP[AppRoute.HELP].path} element={<HelpPage {...pageProps} />} />
          <Route
            path={ROUTE_MAP[AppRoute.EVENT_DETAIL].path}
            element={<EventDetailPage {...pageProps} onBack={() => navigateTo(AppRoute.EVENTS)} />}
          />
          <Route
            path={ROUTE_MAP[AppRoute.GUARDIAN].path}
            element={<GuardianApprovalPage onSendSuccess={() => navigateTo(AppRoute.SENT)} onSignOut={logout} />}
          />
          <Route
            path={ROUTE_MAP[AppRoute.SENT].path}
            element={<RequestSentPage onComplete={() => navigateTo(AppRoute.HOME)} />}
          />
          <Route element={<RoleGuard allowedRoles={[UserRole.PARENT]} />}>
            <Route path={ROUTE_MAP[AppRoute.SUPERVISION].path} element={<SupervisionPage {...pageProps} />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate replace to={ROUTE_MAP[AppRoute.HOME].path} />} />
      </Routes>
    </div>
  );
}

export function AppRouter() {
  return <BrowserRouter><RouteTree /></BrowserRouter>;
}
