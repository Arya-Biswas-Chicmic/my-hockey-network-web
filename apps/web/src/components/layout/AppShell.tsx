import React, { ReactNode } from 'react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';

export interface AppShellProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string, extraData?: { selectedWardId?: string }) => void;
  onLogout?: () => void;
  onCreatePostClick?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab = 'home',
  onTabChange,
  onLogout,
  onCreatePostClick,
}) => {
  return (
    <div className="mhn-app-shell">
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

      <div className="mhn-app-content mhn-home-page-root min-h-dvh lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden">
        {children}
      </div>
    </div>
  );
};
