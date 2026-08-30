import React from 'react';
import { useSearchParams } from 'next/navigation';
import { FeedPermissionBanner } from '@/components/common/FeedPermissionBanner';
import { ConnectionsView, type ConnectionMember } from '@/components/features/network/ConnectionsView';
import { PageShell } from '@/components/layout/PageShell';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

/**
 * Standalone Connections page (Figma node 2176-17096) — a dedicated sidebar
 * destination for `ConnectionsView`, which previously only lived nested
 * inside My Network behind its "connectors"/"connections" menu item.
 * Feedback 2026-08-29: "We built a connection page but we are showing
 * anywhere... add left panel add new section with name connections...
 * remove additional component" — this page is intentionally just the
 * sidebar (rendered once by `AppShell`, not here) plus `ConnectionsView`
 * itself, no extra left-column card the way My Network wraps it; the
 * Figma reference has no right rail either, so this doesn't add one.
 */
export const ConnectionsPage: React.FC<PageProps> = ({ onNavigate }) => {
  const searchParams = useSearchParams();
  const initialTab: ConnectionMember['type'] = searchParams.get('tab') === 'followers' ? 'followers' : 'following';

  return (
    <>
      <FeedPermissionBanner onNavigate={onNavigate} />

      <PageShell className="mhn-connections-page-container lg:min-h-0 lg:flex-1 lg:overflow-y-auto pb-16">
        <ConnectionsView
          initialTab={initialTab}
          onMessageClick={() => onNavigate && onNavigate('messaging')}
        />
      </PageShell>
    </>
  );
};
