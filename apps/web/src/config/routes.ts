import React from 'react';
import { AppRoute } from '../enums/routes';
import { paths } from '../constants/paths';
import { 
  HomePage, 
  MyNetworkPage, 
  EventsPage, 
  MessagingPage, 
  NotificationsPage, 
  ProfilePage, 
  SettingsPage, 
  SupervisionPage, 
  EventDetailPage, 
  OnboardingPage, 
  GuardianApprovalPage, 
  RequestSentPage 
} from '../pages';

export { AppRoute };

export interface RouteDefinition {
  key: AppRoute;
  path: string;
  isProtected: boolean;
  component: React.ComponentType<any>;
}

export const ROUTE_MAP: Record<AppRoute, RouteDefinition> = {
  [AppRoute.HOME]: {
    key: AppRoute.HOME,
    path: paths.home,
    isProtected: true,
    component: HomePage,
  },
  [AppRoute.NETWORK]: {
    key: AppRoute.NETWORK,
    path: paths.network,
    isProtected: true,
    component: MyNetworkPage,
  },
  [AppRoute.EVENTS]: {
    key: AppRoute.EVENTS,
    path: paths.events,
    isProtected: true,
    component: EventsPage,
  },
  [AppRoute.MESSAGING]: {
    key: AppRoute.MESSAGING,
    path: paths.messaging,
    isProtected: true,
    component: MessagingPage,
  },
  [AppRoute.NOTIFICATIONS]: {
    key: AppRoute.NOTIFICATIONS,
    path: paths.notifications,
    isProtected: true,
    component: NotificationsPage,
  },
  [AppRoute.PROFILE]: {
    key: AppRoute.PROFILE,
    path: paths.profile,
    isProtected: true,
    component: ProfilePage,
  },
  [AppRoute.SETTINGS]: {
    key: AppRoute.SETTINGS,
    path: paths.settings,
    isProtected: true,
    component: SettingsPage,
  },
  [AppRoute.SUPERVISION]: {
    key: AppRoute.SUPERVISION,
    path: paths.supervision,
    isProtected: true,
    component: SupervisionPage,
  },
  [AppRoute.EVENT_DETAIL]: {
    key: AppRoute.EVENT_DETAIL,
    path: paths.eventDetail,
    isProtected: true,
    component: EventDetailPage,
  },
  [AppRoute.ONBOARDING]: {
    key: AppRoute.ONBOARDING,
    path: paths.auth.onboarding,
    isProtected: false,
    component: OnboardingPage,
  },
  [AppRoute.GUARDIAN]: {
    key: AppRoute.GUARDIAN,
    path: paths.auth.guardian,
    isProtected: false,
    component: GuardianApprovalPage,
  },
  [AppRoute.SENT]: {
    key: AppRoute.SENT,
    path: paths.auth.sent,
    isProtected: false,
    component: RequestSentPage,
  },
};

export function getRouteFromPath(path: string): AppRoute {
  const cleanPath = path.replace(/^\//, '').trim().toLowerCase();
  if (!cleanPath || cleanPath === 'home') return AppRoute.HOME;

  const entry = Object.values(ROUTE_MAP).find(
    (route) => route.path.replace(/^\//, '').toLowerCase() === cleanPath || route.key === cleanPath
  );

  return entry ? entry.key : AppRoute.HOME;
}
