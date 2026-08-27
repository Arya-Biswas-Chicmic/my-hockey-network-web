import { AppRoute } from '@/enums/routes';
import { UserRole } from '@/enums/role';
import { paths } from '@/constants/paths';

export { AppRoute };

export interface RouteDefinition {
  key: AppRoute;
  path: string;
  isProtected: boolean;
  allowedRoles?: UserRole[];
}

export const ROUTE_MAP: Record<AppRoute, RouteDefinition> = {
  [AppRoute.HOME]: {
    key: AppRoute.HOME,
    path: paths.home,
    isProtected: true,
  },
  [AppRoute.NETWORK]: {
    key: AppRoute.NETWORK,
    path: paths.network,
    isProtected: true,
  },
  [AppRoute.EVENTS]: {
    key: AppRoute.EVENTS,
    path: paths.events,
    isProtected: true,
  },
  [AppRoute.MESSAGING]: {
    key: AppRoute.MESSAGING,
    path: paths.messaging,
    isProtected: true,
  },
  [AppRoute.NOTIFICATIONS]: {
    key: AppRoute.NOTIFICATIONS,
    path: paths.notifications,
    isProtected: true,
  },
  [AppRoute.PROFILE]: {
    key: AppRoute.PROFILE,
    path: paths.profile,
    isProtected: true,
  },
  [AppRoute.SETTINGS]: {
    key: AppRoute.SETTINGS,
    path: paths.settings,
    isProtected: true,
  },
  [AppRoute.SUPERVISION]: {
    key: AppRoute.SUPERVISION,
    path: paths.supervision,
    isProtected: true,
    allowedRoles: [UserRole.PARENT],
  },
  [AppRoute.EVENT_DETAIL]: {
    key: AppRoute.EVENT_DETAIL,
    path: paths.eventDetail,
    isProtected: true,
  },
  [AppRoute.HELP]: {
    key: AppRoute.HELP,
    path: paths.help,
    isProtected: true,
  },
  [AppRoute.EXPLORE]: {
    key: AppRoute.EXPLORE,
    path: paths.explore,
    isProtected: true,
  },
  [AppRoute.GROUPS]: {
    key: AppRoute.GROUPS,
    path: paths.groups,
    isProtected: true,
  },
  [AppRoute.TEAMS]: {
    key: AppRoute.TEAMS,
    path: paths.teams,
    isProtected: true,
  },
  [AppRoute.SAVED]: {
    key: AppRoute.SAVED,
    path: paths.saved,
    isProtected: true,
  },
  [AppRoute.ONBOARDING]: {
    key: AppRoute.ONBOARDING,
    path: paths.auth.onboarding,
    isProtected: false,
  },
  [AppRoute.GUARDIAN]: {
    key: AppRoute.GUARDIAN,
    path: paths.auth.guardian,
    isProtected: false,
  },
  [AppRoute.SENT]: {
    key: AppRoute.SENT,
    path: paths.auth.sent,
    isProtected: false,
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
