'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { OtherUserProfileModal } from '@/components/features/profile/OtherUserProfileModal';
import { cn } from '@/utils/cn';

export interface AppShellProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string, extraData?: { selectedWardId?: string }) => void;
  onLogout?: () => void;
  onCreatePostClick?: () => void;
}

// Routes that "drill in" from the profile dropdown (Settings, Supervision,
// Help & Support) render full-bleed with no persistent left sidebar per
// Figma — see the `.mhn-app-shell--compact` comment in index.css.
const COMPACT_SHELL_ROUTES = ['/settings', '/supervision', '/help'];

function isCompactShellRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return COMPACT_SHELL_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab = 'home',
  onTabChange,
  onLogout,
  onCreatePostClick,
}) => {
  const pathname = usePathname();
  const isCompact = isCompactShellRoute(pathname);

  return (
    <div className={cn('mhn-app-shell', isCompact && 'mhn-app-shell--compact')}>
      {!isCompact && (
        <>
          <LeftSidebar
            activeTab={activeTab}
            onTabChange={onTabChange}
            onLogout={onLogout}
            onCreatePostClick={onCreatePostClick}
          />

          <MobileNavigation
            activeTab={activeTab}
            onTabChange={(tab) => onTabChange?.(tab)}
            onCreatePostClick={onCreatePostClick}
          />
        </>
      )}

      <div className="mhn-app-content mhn-home-page-root min-h-dvh lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden">
        {children}
      </div>

      <OtherUserProfileModal />
    </div>
  );
};
