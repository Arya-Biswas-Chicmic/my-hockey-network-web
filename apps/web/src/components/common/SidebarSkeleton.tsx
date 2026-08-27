import React from 'react';

// Three label-bar widths (short/medium/long — see `.mhn-sidebar-skeleton-
// label-{sm,md,lg}` in index.css), cycled across the 10 real Sidebar.tsx nav
// items (Home, Messaging, Explore, Events, Groups, Teams, Notifications,
// Saved, Profile, Create Post) so the placeholders aren't all one uniform
// length, without resorting to a per-item inline `style` width.
const LABEL_WIDTH_CLASSES = [
  'mhn-sidebar-skeleton-label-sm',
  'mhn-sidebar-skeleton-label-lg',
  'mhn-sidebar-skeleton-label-md',
];

/**
 * Loading placeholder for `Sidebar.tsx`, used inside `FullAppSkeletonLoader`
 * during route transitions and auth checks. Renders through the same real
 * `.mhn-sidebar`/`.mhn-sidebar-nav`/`.mhn-sidebar-footer` classes as the
 * actual sidebar (not a bespoke layout) so it's pixel-matched and swaps in
 * without a layout shift once the real one mounts. Replaces the old
 * `HeaderSkeleton`, which rendered a horizontal top-bar skeleton modeled on
 * the now-removed `Header.tsx` top nav.
 */
export const SidebarSkeleton: React.FC = () => (
  <aside className="mhn-sidebar" aria-hidden="true">
    <div className="mhn-sidebar-logo">
      <div className="mhn-sidebar-skeleton-box mhn-sidebar-skeleton-logo" />
    </div>

    <nav className="mhn-sidebar-nav">
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className="mhn-sidebar-nav-item mhn-sidebar-skeleton-nav-item">
          <div className="mhn-sidebar-skeleton-box mhn-sidebar-skeleton-icon" />
          <div
            className={`mhn-sidebar-skeleton-box mhn-sidebar-skeleton-label ${LABEL_WIDTH_CLASSES[index % LABEL_WIDTH_CLASSES.length]}`}
          />
        </div>
      ))}
    </nav>

    <div className="mhn-sidebar-footer">
      <div className="mhn-sidebar-user-chip">
        <div className="mhn-sidebar-skeleton-box mhn-sidebar-skeleton-avatar" />
        <div className="mhn-sidebar-skeleton-box mhn-sidebar-skeleton-name" />
      </div>
    </div>
  </aside>
);
