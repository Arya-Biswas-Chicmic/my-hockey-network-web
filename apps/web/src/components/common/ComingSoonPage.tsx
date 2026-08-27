import type { ReactNode } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { NoDataFound } from '@/components/common/no-data-found';

export interface ComingSoonPageProps {
  activeTab: string;
  title: string;
  description: string;
  icon?: ReactNode;
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

/** Shared shell for a sidebar-nav page whose content isn't built yet
 * (Explore/Groups/Teams/Saved) — honest "not available yet" state rather
 * than a 404 or fabricated content, matching this project's data policy. */
export function ComingSoonPage({ activeTab, title, description, icon, onNavigate, onLogout }: Readonly<ComingSoonPageProps>) {
  return (
    <div className="mhn-app-shell">
      <Sidebar activeTab={activeTab} onTabChange={onNavigate} onLogout={onLogout} />
      <div className="mhn-app-content mhn-coming-soon-content">
        <NoDataFound title={title} description={description} icon={icon} />
      </div>
    </div>
  );
}
