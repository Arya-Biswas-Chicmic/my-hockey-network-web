export type SidebarNavigationIconName =
  | 'associations'
  | 'dashboard'
  | 'events'
  | 'explore'
  | 'feed'
  | 'groups'
  | 'home'
  | 'messaging'
  | 'network'
  | 'notifications'
  | 'profile'
  | 'saved'
  | 'teams';

interface SidebarNavigationIconProps {
  name: SidebarNavigationIconName;
  active: boolean;
  className?: string;
}

/**
 * Renders the exact selected/unselected sidebar artwork exported from Figma.
 * CSS masks preserve each exported glyph while letting the application theme
 * own its color through `currentColor`.
 */
export function SidebarNavigationIcon({
  name,
  active,
  className = '',
}: Readonly<SidebarNavigationIconProps>) {
  const state = active ? 'active' : 'inactive';

  return (
    <span
      className={`mhn-sidebar-nav-icon mhn-sidebar-nav-icon--${name}-${state} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
