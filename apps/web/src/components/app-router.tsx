import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppRoute, ROUTE_MAP } from '@/config/routes';
import { UserRole } from '@/enums/role';
import { AuthGuard } from '@/guards/auth-guard';
import { GuestGuard } from '@/guards/guest-guard';
import { RoleGuard } from '@/guards/role-guard';
import { useAuth } from '@/hooks/use-auth';
import { FullAppSkeletonLoader } from '@/components/common/FullAppSkeletonLoader';

const HomePage = lazy(() => import('@/pages/home-page').then((module) => ({ default: module.HomePage })));
const MyNetworkPage = lazy(() => import('@/pages/my-network-page').then((module) => ({ default: module.MyNetworkPage })));
const EventsPage = lazy(() => import('@/pages/events-page').then((module) => ({ default: module.EventsPage })));
const MessagingPage = lazy(() => import('@/pages/messaging-page').then((module) => ({ default: module.MessagingPage })));
const NotificationsPage = lazy(() => import('@/pages/notifications-page').then((module) => ({ default: module.NotificationsPage })));
const ProfilePage = lazy(() => import('@/pages/profile-page').then((module) => ({ default: module.ProfilePage })));
const SettingsPage = lazy(() => import('@/pages/settings-page').then((module) => ({ default: module.SettingsPage })));
const HelpPage = lazy(() => import('@/pages/help-page').then((module) => ({ default: module.HelpPage })));
const EventDetailPage = lazy(() => import('@/pages/event-detail-page').then((module) => ({ default: module.EventDetailPage })));
const GuardianApprovalPage = lazy(() => import('@/pages/guardian-approval-page').then((module) => ({ default: module.GuardianApprovalPage })));
const RequestSentPage = lazy(() => import('@/pages/request-sent-page').then((module) => ({ default: module.RequestSentPage })));
const SupervisionPage = lazy(() => import('@/pages/supervision-page').then((module) => ({ default: module.SupervisionPage })));
const OnboardingPage = lazy(() => import('@/pages/onboarding-page').then((module) => ({ default: module.OnboardingPage })));

function RouteTree() {
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const navigateTo = (route: AppRoute | string, extraData?: Record<string, unknown>) => {
    const definition = ROUTE_MAP[route as AppRoute];
    let targetPath = definition?.path ?? `/${String(route).replace(/^\//, '')}`;
    const possibleUserId = extraData?.userId || extraData?.selectedWardId || extraData?.childId;
    const targetUserId = typeof possibleUserId === 'string' ? possibleUserId : undefined;
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
      <Suspense fallback={<FullAppSkeletonLoader />}>
      <Routes>
        <Route element={<GuestGuard />}>
          <Route
            path={ROUTE_MAP[AppRoute.ONBOARDING].path}
            element={<OnboardingPage onComplete={() => navigateTo(AppRoute.HOME)} />}
          />
        </Route>

        <Route
          path={ROUTE_MAP[AppRoute.GUARDIAN].path}
          element={
            <GuardianApprovalPage
              onSendSuccess={() => navigateTo(AppRoute.SENT)}
              onSignOut={logout}
              onContactSupport={() => navigateTo(AppRoute.HELP)}
            />
          }
        />
        <Route
          path={ROUTE_MAP[AppRoute.SENT].path}
          element={<RequestSentPage onComplete={() => navigateTo(AppRoute.HOME)} />}
        />

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
          <Route element={<RoleGuard allowedRoles={[UserRole.PARENT]} />}>
            <Route path={ROUTE_MAP[AppRoute.SUPERVISION].path} element={<SupervisionPage {...pageProps} />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate replace to={ROUTE_MAP[AppRoute.HOME].path} />} />
      </Routes>
      </Suspense>
    </div>
  );
}

export function AppRouter() {
  return <BrowserRouter><RouteTree /></BrowserRouter>;
}
