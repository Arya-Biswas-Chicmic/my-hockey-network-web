import { Button } from '@/components/common/Button';
import { Input, Select, Dropdown } from '@/components/common/FormControls';
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { NoDataFound } from '@/components/common/no-data-found';
import { useDebounce } from '@/hooks/use-debounce';
import { NetworkSkeletonCard } from '@/components/features/network/NetworkSkeletonLoader';
import {
  getNotificationSettings,
  updateNotificationSettings,
  getBlockedUsersSettings,
  removeRelationship,
  type BlockedUserDTO,
  type NotificationSettingItem,
} from '@my-hockey-network/core';
import { extractErrorMessage, showSuccessToast, showErrorToast } from '@/utils/toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import { NavTabEnum, SettingsSubTabEnum } from '@my-hockey-network/contracts';
import { Ban, MapPin, Search } from 'lucide-react';



interface SettingsPageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState<NavTabEnum | string>(NavTabEnum.SETTINGS);
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTabEnum>(SettingsSubTabEnum.BLOCKED);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  const [blockedUsers, setBlockedUsers] = useState<Array<{
    id: string;
    name: string;
    roleTag: string;
    avatarUrl: string;
    teamName: string;
    teamLogo: string;
    location: string;
  }>>([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [updatingNotifKey, setUpdatingNotifKey] = useState<string | null>(null);
  const [unblockingIds, setUnblockingIds] = useState<string[]>([]);

  // Load live blocked users from GET /v1/settings/blocked
  const fetchBlockedUsers = async (showSkeleton = true) => {
    if (showSkeleton) setIsLoadingBlocked(true);
    try {
      const res = await getBlockedUsersSettings();
      if (res && res.items && Array.isArray(res.items)) {
        const mapped = res.items.map((b: BlockedUserDTO) => {
          const cp = b.counterparty || b;
          return {
            id: b.id || b.targetId || `b_${Math.random()}`,
            name: cp.displayName || cp.name || 'Blocked User',
            roleTag: cp.roleTag || (cp.position ? `${cp.position} ${cp.jerseyNumber ? `• #${cp.jerseyNumber}` : ''}` : cp.primaryRole || 'Player'),
            avatarUrl: cp.avatarUrl || '/userPlaceholder.png',
            teamName: cp.teamName || 'HC Bloemendaal',
            teamLogo: cp.teamLogo || '/kcBlue.png',
            location: cp.location || cp.city || 'Canada',
          };
        });
        setBlockedUsers(mapped);
      } else {
        setBlockedUsers([]);
      }
    } catch (err: unknown) {
      console.warn('❌ [SettingsPage] getBlockedUsersSettings notice:', extractErrorMessage(err));
    } finally {
      if (showSkeleton) setIsLoadingBlocked(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers(true);
  }, []);

  // Load live notification settings from GET /v1/settings/notifications
  const fetchNotificationSettings = async (showShimmer = true) => {
    if (showShimmer) setIsLoadingNotifications(true);
    try {
      const res = await getNotificationSettings();
      if (res && Array.isArray(res.items)) {
        const itemMap: Record<string, boolean> = {};
        res.items.forEach((it: NotificationSettingItem) => {
          if (it.key === 'MESSAGE') itemMap.message = !!it.enabled;
          if (it.key === 'CONNECTION_REQUEST') itemMap.connectionRequest = !!it.enabled;
          if (it.key === 'ACTIVITY') itemMap.activity = !!it.enabled;
          if (it.key === 'MENTION') itemMap.mention = !!it.enabled;
          if (it.key === 'GROUP') itemMap.group = !!it.enabled;
        });
        setNotifications((prev) => ({
          message: itemMap.message ?? prev.message,
          connectionRequest: itemMap.connectionRequest ?? prev.connectionRequest,
          activity: itemMap.activity ?? prev.activity,
          mention: itemMap.mention ?? prev.mention,
          group: itemMap.group ?? prev.group,
        }));
      }
    } catch (err: unknown) {
      console.warn('❌ [SettingsPage] getNotificationSettings notice:', extractErrorMessage(err));
    } finally {
      if (showShimmer) setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotificationSettings(true);
  }, []);

  const handleUnblock = async (userId: string) => {
    if (unblockingIds.includes(userId)) return;
    setUnblockingIds((prev) => [...prev, userId]);

    try {
      await removeRelationship(userId);

      // Show Toast Notification
      showSuccessToast(SUCCESS_MESSAGES.USER_UNBLOCKED);

      // Re-fetch GET API with shimmer loader enabled
      await fetchBlockedUsers(true);
    } catch (err: unknown) {
      console.error('❌ [SettingsPage] Unblock Error:', err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_UNBLOCK);
    } finally {
      setUnblockingIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const filteredBlockedUsers = blockedUsers.filter(
    (user) =>
      !debouncedSearchQuery.trim() ||
      user.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      user.roleTag.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  // Notification Toggle Switch States matching Figma Image 30
  const [notifications, setNotifications] = useState({
    message: true,
    connectionRequest: true,
    activity: false,
    mention: true,
    group: true,
  });

  const toggleNotification = async (key: keyof typeof notifications) => {
    const updatedValue = !notifications[key];
    const newNotifs = { ...notifications, [key]: updatedValue };
    setNotifications(newNotifs);
    setUpdatingNotifKey(key);

    try {
      const itemsPayload = [
        { key: 'MESSAGE', enabled: newNotifs.message },
        { key: 'CONNECTION_REQUEST', enabled: newNotifs.connectionRequest },
        { key: 'ACTIVITY', enabled: newNotifs.activity },
        { key: 'MENTION', enabled: newNotifs.mention },
        { key: 'GROUP', enabled: newNotifs.group },
      ];
      await updateNotificationSettings(itemsPayload);

      showSuccessToast(SUCCESS_MESSAGES.NOTIFICATION_SETTING_UPDATED);

      // Re-fetch GET API with shimmer loader enabled after updating settings
      await fetchNotificationSettings(true);
    } catch (err: unknown) {
      console.warn('❌ [SettingsPage] updateNotificationSettings notice:', extractErrorMessage(err));
      showErrorToast(err, ERROR_MESSAGES.FAILED_NOTIFICATION_SETTING);
    } finally {

      setUpdatingNotifKey(null);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const notificationItems = [
    {
      id: 'message' as const,
      title: 'Message notifications',
      subtitle: 'Get notified when you receive a message',
      enabled: notifications.message,
    },
    {
      id: 'connectionRequest' as const,
      title: 'Connection request notifications',
      subtitle: 'Get notified about incoming requests',
      enabled: notifications.connectionRequest,
    },
    {
      id: 'activity' as const,
      title: 'Activity notifications',
      subtitle: 'Reactions, comments on your posts',
      enabled: notifications.activity,
    },
    {
      id: 'mention' as const,
      title: 'Mention notifications',
      subtitle: 'Get notified when someone mentions you',
      enabled: notifications.mention,
    },
    {
      id: 'group' as const,
      title: 'Group notifications',
      subtitle: 'Get notified when someone is added to the group',
      enabled: notifications.group,
    },
  ];

  const filteredNotificationItems = notificationItems.filter(
    (item) =>
      !debouncedSearchQuery.trim() ||
      item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  return (
    <div className="mhn-settings-page-root">
      {/* Top Header Navbar */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className="mhn-settings-main-container">
        {/* Top Header Row with Title and Search Input */}
        <div className="mhn-settings-top-bar">
          <h1 className="mhn-settings-title">Settings</h1>
          <div className="mhn-settings-search-wrapper">
            <Search className="mhn-settings-search-icon" size={16} aria-hidden="true" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.toLowerCase().includes('notif')) {
                  setActiveSubTab(SettingsSubTabEnum.NOTIFICATION);
                } else if (val.toLowerCase().includes('block')) {
                  setActiveSubTab(SettingsSubTabEnum.BLOCKED);
                } else if (val.toLowerCase().includes('email') || val.toLowerCase().includes('role') || val.toLowerCase().includes('lang')) {
                  setActiveSubTab(SettingsSubTabEnum.GENERAL);
                }
              }}
              placeholder="Search settings..."
              className="mhn-settings-search-input"
            />
          </div>
        </div>

        {/* 2-Column Settings Card Container */}
        <div className="mhn-settings-card-wrapper">
          {/* Left Sub-Navigation Menu Column */}
          <aside className="mhn-settings-sidebar">
            <Button
              onClick={() => setActiveSubTab(SettingsSubTabEnum.GENERAL)}
              className={`mhn-settings-subtab-btn ${activeSubTab === SettingsSubTabEnum.GENERAL ? 'mhn-subtab-active' : ''}`}
            >
              General
            </Button>
            <Button
              onClick={() => setActiveSubTab(SettingsSubTabEnum.NOTIFICATION)}
              className={`mhn-settings-subtab-btn ${activeSubTab === SettingsSubTabEnum.NOTIFICATION ? 'mhn-subtab-active' : ''}`}
            >
              Notification
            </Button>
            <Button
              onClick={() => setActiveSubTab(SettingsSubTabEnum.BLOCKED)}
              className={`mhn-settings-subtab-btn ${activeSubTab === SettingsSubTabEnum.BLOCKED ? 'mhn-subtab-active' : ''}`}
            >
              Blocked Users
            </Button>
          </aside>

          {/* Right Content Area */}
          <section className="mhn-settings-content-area">
            {activeSubTab === SettingsSubTabEnum.NOTIFICATION && (
              <div className="mhn-notification-settings-list">
                {isLoadingNotifications ? (
                  [1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="mhn-notification-setting-row mhn-notif-skeleton-row">
                      <div className="mhn-comment-skeleton-meta">
                        <div className="mhn-shimmer-box mhn-notif-skeleton-title-line" />
                        <div className="mhn-shimmer-box mhn-notif-skeleton-sub-line" />
                      </div>
                      <div className="mhn-shimmer-box mhn-notif-skeleton-toggle-pill" />
                    </div>
                  ))
                ) : filteredNotificationItems.length === 0 ? (
                  <NoDataFound
                    title="No Settings Found"
                    description={`No notification settings match "${searchQuery}".`}
                  />
                ) : (
                  filteredNotificationItems.map((item) => (
                    <div key={item.id} className="mhn-notification-setting-row">
                      <div className="mhn-notification-setting-text">
                        <h4 className="mhn-notification-item-title">{item.title}</h4>
                        <p className="mhn-notification-item-subtitle">{item.subtitle}</p>
                      </div>
                      <div className="mhn-btn-loading-flex">
                        {updatingNotifKey === item.id && (
                          <div
                            className="mhn-spinner-mini"
                          />
                        )}
                        <Button
                          type="button"
                          onClick={() => toggleNotification(item.id)}
                          disabled={updatingNotifKey === item.id}
                          className={`mhn-toggle-switch ${item.enabled ? 'mhn-toggle-on' : 'mhn-toggle-off'} ${updatingNotifKey === item.id ? 'mhn-updating-opacity' : ''}`}
                          aria-label={item.title}
                        >
                          <div className="mhn-toggle-handle" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeSubTab === SettingsSubTabEnum.GENERAL && (
              <div className="mhn-general-settings-view">
                <h3 className="mhn-settings-section-heading">Account & General Settings</h3>
                <div className="mhn-general-setting-field">
                  <label className="mhn-setting-label">Email Address</label>
                  <Input
                    type="email"
                    value="sakshaiukym.garg@chicmicstudios.in"
                    readOnly
                    className="mhn-setting-input"
                  />
                </div>
                <div className="mhn-general-setting-field">
                  <label className="mhn-setting-label">Primary Role</label>
                  <Input
                    type="text"
                    value="PLAYER"
                    readOnly
                    className="mhn-setting-input"
                  />
                </div>
                <Dropdown
                  label="Language"
                  value="en"
                  options={[
                    { value: 'en', label: 'English (US)' },
                    { value: 'de', label: 'German' },
                  ]}
                  onChange={() => {}}
                  placeholder=""
                />
              </div>
            )}

            {activeSubTab === SettingsSubTabEnum.BLOCKED && (
              <div className="mhn-blocked-users-view">
                {isLoadingBlocked ? (
                  <div className="mhn-blocked-users-grid">
                    {[1, 2, 3, 4].map((n) => (
                      <NetworkSkeletonCard key={n} />
                    ))}
                  </div>
                ) : filteredBlockedUsers.length === 0 ? (
                  <NoDataFound
                    title="No Blocked Users"
                    description={
                      searchQuery
                        ? `No blocked users match "${searchQuery}".`
                        : "You haven't blocked any users yet."
                    }
                    icon={(
                      <Ban size={32} color="#64748B" aria-hidden="true" />
                    )}
                  />
                ) : (
                  <div className="mhn-blocked-users-grid">
                    {filteredBlockedUsers.map((user) => (
                      <div key={user.id} className="mhn-blocked-user-card">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="mhn-blocked-user-avatar"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                          }}
                        />
                        <h4 className="mhn-blocked-user-name">{user.name}</h4>
                        <span className="mhn-blocked-user-role">{user.roleTag}</span>

                        <div className="mhn-blocked-user-team-row">
                          <img src={user.teamLogo} alt={user.teamName} className="mhn-blocked-team-logo" />
                          <span className="mhn-blocked-team-name">{user.teamName}</span>
                        </div>

                        <div className="mhn-blocked-user-loc-row">
                          <MapPin size={12} aria-hidden="true" />
                          <span>{user.location}</span>
                        </div>

                        <Button
                          type="button"
                          onClick={() => handleUnblock(user.id)}
                          disabled={unblockingIds.includes(user.id)}
                          className="mhn-btn-unblock mhn-btn-loading-flex"
                        >
                          {unblockingIds.includes(user.id) ? (
                            <>
                              <div
                                className="mhn-spinner-white-mini"
                              />
                              <span>Unblocking...</span>
                            </>
                          ) : (
                            'Unblock'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
