import type { SidebarNavigationIconName } from '@/components/icons/SidebarNavigationIcon';

export interface NavigationItemConfig {
  id: string;
  label: string;
  icon: SidebarNavigationIconName;
  route: string;
  additionalRoutes?: readonly string[];
}

export const NAVIGATION_ITEMS: readonly NavigationItemConfig[] = [
  { id: 'home', label: 'Home', icon: 'home', route: '/home' },
  { id: 'messaging', label: 'Messaging', icon: 'messaging', route: '/messaging' },
  { id: 'explore', label: 'Explore', icon: 'explore', route: '/explore' },
  {
    id: 'events',
    label: 'Events',
    icon: 'events',
    route: '/events',
    additionalRoutes: ['/event-detail'],
  },
  { id: 'groups', label: 'Groups', icon: 'groups', route: '/groups' },
  { id: 'connections', label: 'Connections', icon: 'network', route: '/connections' },
  { id: 'teams', label: 'Teams', icon: 'teams', route: '/teams' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', route: '/notifications' },
  { id: 'saved', label: 'Saved', icon: 'saved', route: '/saved' },
  { id: 'profile', label: 'Profile', icon: 'profile', route: '/profile' },
] as const;

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isNavigationItemActive(pathname: string, item: NavigationItemConfig): boolean {
  return [item.route, ...(item.additionalRoutes ?? [])].some((route) => matchesRoute(pathname, route));
}

export function getNavigationItemById(id: string): NavigationItemConfig | undefined {
  return NAVIGATION_ITEMS.find((item) => item.id === id);
}
