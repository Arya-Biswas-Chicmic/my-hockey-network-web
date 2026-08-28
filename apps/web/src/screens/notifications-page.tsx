import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { NotificationCard } from '@/components/features/notifications/NotificationCard';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { showSuccessToast, showInfoToast } from '@/utils/toast';
import { PageShell } from '@/components/layout/PageShell';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

interface NotificationItemData {
  id: string;
  avatar: string;
  senderName: string;
  text: string;
  time: string;
  isUnread?: boolean;
  isRequest?: boolean;
  requestStatus?: 'pending' | 'accepted' | 'rejected';
}

const INITIAL_NOTIFICATIONS: NotificationItemData[] = [
  {
    id: 'notif-1',
    senderName: 'Lucifer',
    avatar: '/steve.webp',
    text: 'Follow your friends to get things started.',
    time: '1h',
    isUnread: false,
    isRequest: false,
  },
  {
    id: 'notif-2',
    senderName: 'David',
    avatar: '/david.webp',
    text: 'send you friend request',
    time: '1h',
    isUnread: false,
    isRequest: true,
    requestStatus: 'pending',
  },
  {
    id: 'notif-3',
    senderName: 'John',
    avatar: '/gerard.webp',
    text: 'Invite your friends to get things started.',
    time: '1h',
    isUnread: true,
    isRequest: false,
  },
  {
    id: 'notif-4',
    senderName: 'Steve',
    avatar: '/saylor.webp',
    text: 'Invite you to join there team',
    time: '1h',
    isUnread: false,
    isRequest: true,
    requestStatus: 'pending',
  },
  {
    id: 'notif-5',
    senderName: 'Noah',
    avatar: '/mai.webp',
    text: 'wants to add you as their guardian',
    time: '1h',
    isUnread: false,
    isRequest: true,
    requestStatus: 'pending',
  },
];

export const NotificationsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'requests'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItemData[]>(INITIAL_NOTIFICATIONS);

  const handleAcceptRequest = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, requestStatus: 'accepted' } : n))
    );
    showSuccessToast('Request accepted');
  };

  const handleRejectRequest = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, requestStatus: 'rejected' } : n))
    );
    showInfoToast('Request rejected');
  };

  const unreadCount = notifications.filter((n) => n.isUnread).length;
  const requestsCount = notifications.filter((n) => n.isRequest && n.requestStatus === 'pending').length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      !searchQuery.trim() ||
      n.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.text.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'unread') return matchesSearch && n.isUnread;
    if (activeTab === 'requests') return matchesSearch && n.isRequest;
    return matchesSearch;
  });

  return (
    <>
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

      <PageShell className="mhn-notifications-main-container flex flex-col gap-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto pb-16">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>

          <div className="relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-10 pl-9 pr-4 bg-[#0D1627] border border-[#182740] rounded-xl text-xs text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#168BFF] transition-all"
            />
          </div>
        </div>

        {/* Navigation Tabs Bar (All, Unread, Requests) */}
        <div className="flex items-center gap-8 border-b border-[#182740] pb-2">
          <Button
            onClick={() => setActiveTab('all')}
            className={`text-sm font-semibold relative pb-2 transition-colors ${
              activeTab === 'all'
                ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({notifications.length})
          </Button>
          <Button
            onClick={() => setActiveTab('unread')}
            className={`text-sm font-semibold relative pb-2 transition-colors ${
              activeTab === 'unread'
                ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            onClick={() => setActiveTab('requests')}
            className={`text-sm font-semibold relative pb-2 transition-colors ${
              activeTab === 'requests'
                ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Requests ({requestsCount})
          </Button>
        </div>

        {/* Notification Items List */}
        <div className="flex flex-col gap-1 mt-2 max-w-[840px]">
          {filteredNotifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              id={notif.id}
              avatar={notif.avatar}
              senderName={notif.senderName}
              text={notif.text}
              time={notif.time}
              isUnread={notif.isUnread}
              isRequest={notif.isRequest}
              requestStatus={notif.requestStatus}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          ))}
        </div>
      </PageShell>
    </>
  );
};

