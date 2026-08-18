import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { PendingBanner } from '../components/common/PendingBanner';
import { NotificationCard, NotificationItemProps } from '../components/features/notifications/NotificationCard';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const NotificationsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('notifications');
  const [activeFilterTab, setActiveFilterTab] = useState('all');

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const notificationsList: NotificationItemProps[] = [
    {
      id: 'n1',
      avatar: '/steve.png',
      senderName: 'Steve',
      text: 'Follow your friends to get things started.',
      time: '1h',
      isUnread: false
    },
    {
      id: 'n2',
      avatar: '/gerard.png',
      senderName: 'Steve',
      text: 'Invite your friends to get things started.',
      time: '1h',
      isUnread: true
    }
  ];

  const filteredNotifications = activeFilterTab === 'unread'
    ? notificationsList.filter(n => n.isUnread)
    : notificationsList;

  return (
    <div className="mhn-notifications-page-root">
      {/* Top Header Navigation Bar */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
      />

      {/* Pending Guardian Notice Banner */}
      <PendingBanner
        message="Guardian invitation pending. Your guardian has not yet accepted your request to connect."
        actionText="Manage Invitations"
        onActionClick={() => alert('Manage invitations clicked')}
      />

      {/* Main Centered Content Container */}
      <main className="mhn-notifications-main-container">
        <div className="mhn-notifications-card">
          {/* Header Bar */}
          <div className="mhn-notifications-card-header">
            <h2 className="mhn-notifications-title">Notifications</h2>
            <button className="mhn-notifications-more-btn" aria-label="Notification options">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>

          {/* Filter Pills Bar */}
          <div className="mhn-notifications-pills-bar">
            <button
              onClick={() => setActiveFilterTab('all')}
              className={`mhn-notif-pill ${activeFilterTab === 'all' ? 'mhn-notif-pill-active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilterTab('unread')}
              className={`mhn-notif-pill ${activeFilterTab === 'unread' ? 'mhn-notif-pill-active' : ''}`}
            >
              Unread
            </button>
          </div>

          {/* Notifications List */}
          <div className="mhn-notifications-list">
            {filteredNotifications.map((item) => (
              <NotificationCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
