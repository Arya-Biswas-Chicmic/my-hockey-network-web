import { PATHS } from './paths';

export const PUBLIC_ROUTES = [
  PATHS.ONBOARDING,
  PATHS.GUARDIAN,
  PATHS.SENT,
];

export const PROTECTED_ROUTES = [
  PATHS.HOME,
  PATHS.NETWORK,
  PATHS.EVENTS,
  PATHS.MESSAGING,
  PATHS.NOTIFICATIONS,
  PATHS.PROFILE,
  PATHS.SETTINGS,
  PATHS.SUPERVISION,
];

export function isPublicRoute(path: string): boolean {
  const clean = path.replace(/^\//, '').trim().toLowerCase();
  return PUBLIC_ROUTES.some(r => r.replace(/^\//, '') === clean);
}
