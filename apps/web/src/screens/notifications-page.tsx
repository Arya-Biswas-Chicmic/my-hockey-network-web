import { Button } from '@/components/common/Button';
import React, { useState } from 'react';
import { Header } from '@/components/common/Header';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { NoDataFound } from '@/components/common/no-data-found';
import { MoreHorizontal } from 'lucide-react';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const NotificationsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeNavTab, setActiveNavTab] = useState('notifications');
  const [activeFilterTab, setActiveFilterTab] = useState('all');

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <div className="mhn-notifications-page-root">
      {/* Top Header Navigation Bar */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
      />

      {/* Pending Guardian Notice Banner */}
      {!permissions.allowed && permissions.message && (
        <PendingBanner
          message={permissions.message}
          actionText={permissions.ctaText || 'Complete Profile'}
          onActionClick={() => {
            if (permissions.ctaAction === 'COMPLETE_PROFILE') {
              if (onNavigate) onNavigate('profile');
            } else if (permissions.ctaAction === 'GUARDIAN_APPROVAL') {
              if (onNavigate) onNavigate('supervision');
            } else if (permissions.ctaAction === 'LOGIN') {
              if (onNavigate) onNavigate('login');
            }
          }}
        />
      )}

      {/* Main Centered Content Container */}
      <main className="mhn-notifications-main-container">
        <div className="mhn-notifications-card">
          {/* Header Bar */}
          <div className="mhn-notifications-card-header">
            <h2 className="mhn-notifications-title">Notifications</h2>
            <Button className="mhn-notifications-more-btn" aria-label="Notification options">
              <MoreHorizontal size={20} aria-hidden="true" />
            </Button>
          </div>

          {/* Filter Pills Bar */}
          <div className="mhn-notifications-pills-bar">
            <Button
              onClick={() => setActiveFilterTab('all')}
              className={`mhn-notif-pill ${activeFilterTab === 'all' ? 'mhn-notif-pill-active' : ''}`}
            >
              All
            </Button>
            <Button
              onClick={() => setActiveFilterTab('unread')}
              className={`mhn-notif-pill ${activeFilterTab === 'unread' ? 'mhn-notif-pill-active' : ''}`}
            >
              Unread
            </Button>
          </div>

          {/* Notifications List */}
          <div className="mhn-notifications-list">
            <NoDataFound
              title={activeFilterTab === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
              description="You're all caught up! There are no notifications to display right now."
            />
          </div>
        </div>
      </main>
    </div>
  );
};
