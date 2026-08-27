import { Button } from '@/components/common/Button';
import React, { useMemo, useState } from 'react';
import { Header } from '@/components/common/Header';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { NoDataFound } from '@/components/common/no-data-found';
import { NotificationCard } from '@/components/features/notifications/NotificationCard';
import { useAlertsQuery, useMarkAlertReadMutation, useMarkAllAlertsReadMutation } from '@/hooks/use-notifications';
import { formatRelativeTime } from '@/utils/dateUtils';
import type { AlertItem } from '@my-hockey-network/core';
import { MoreHorizontal } from 'lucide-react';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

function toNotificationItem(alert: AlertItem) {
  const data = alert.data;
  const avatar =
    (typeof data?.avatarUrl === 'string' && data.avatarUrl) ||
    (typeof data?.actorAvatarUrl === 'string' && data.actorAvatarUrl) ||
    '';
  return {
    id: alert.id,
    avatar,
    senderName: alert.title,
    text: alert.body,
    time: formatRelativeTime(alert.createdAt),
    isUnread: !alert.isRead,
  };
}

export const NotificationsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeNavTab, setActiveNavTab] = useState('notifications');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'unread'>('all');

  const alertsQuery = useAlertsQuery(activeFilterTab === 'unread');
  const markReadMutation = useMarkAlertReadMutation();
  const markAllReadMutation = useMarkAllAlertsReadMutation();

  const items = useMemo(
    () => (alertsQuery.data?.items ?? []).map(toNotificationItem),
    [alertsQuery.data],
  );

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleItemClick = (id: string) => {
    const alert = alertsQuery.data?.items.find((a) => a.id === id);
    if (alert && !alert.isRead) {
      markReadMutation.mutate(id);
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
            <Button
              className="mhn-notifications-more-btn"
              aria-label="Mark all notifications as read"
              onClick={() => markAllReadMutation.mutate(undefined)}
              disabled={markAllReadMutation.isPending || items.length === 0}
            >
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
            {alertsQuery.isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="mhn-notification-item mhn-notif-skeleton-row">
                  <div className="mhn-shimmer-box mhn-notification-avatar-box" />
                  <div className="mhn-notification-content">
                    <div className="mhn-shimmer-box mhn-notif-skeleton-title-line" />
                    <div className="mhn-shimmer-box mhn-notif-skeleton-sub-line" />
                  </div>
                </div>
              ))
            ) : items.length === 0 ? (
              <NoDataFound
                title={activeFilterTab === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
                description="You're all caught up! There are no notifications to display right now."
              />
            ) : (
              items.map((item) => (
                <NotificationCard key={item.id} {...item} onItemClick={handleItemClick} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
