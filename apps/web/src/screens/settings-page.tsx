'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Ban, MapPin, Search } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input, Dropdown } from '@/components/common/FormControls';
import { FallbackImage } from '@/components/ui/fallback-image';
import { NoDataFound } from '@/components/common/no-data-found';
import { NetworkSkeletonCard } from '@/components/features/network/NetworkSkeletonLoader';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { PageShell } from '@/components/layout/PageShell';
import { CompactPageHeader } from '@/components/layout/CompactPageHeader';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import { SettingsSubTabEnum } from '@my-hockey-network/contracts';
import {
  useBlockedUsersQuery,
  useUnblockUserMutation,
  useNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  type NotificationSettingsView,
} from '@/hooks/use-settings';

interface SettingsPageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTabEnum>(SettingsSubTabEnum.BLOCKED);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  const blockedUsersQuery = useBlockedUsersQuery();
  const unblockUserMutation = useUnblockUserMutation();
  const notificationSettingsQuery = useNotificationSettingsQuery();
  const updateNotificationSettingsMutation = useUpdateNotificationSettingsMutation();
  const [updatingNotifKey, setUpdatingNotifKey] = useState<string | null>(null);
  // Tracked separately from unblockUserMutation.isPending/variables: a single shared mutation
  // instance only reflects its most recent call, so it can't represent two Unblock clicks on
  // different cards in flight at once — this set can.
  const [unblockingIds, setUnblockingIds] = useState<string[]>([]);

  const handleUnblock = async (userId: string) => {
    if (unblockingIds.includes(userId)) return;
    setUnblockingIds((prev) => [...prev, userId]);
    try {
      await unblockUserMutation.mutateAsync(userId);
      showSuccessToast(SUCCESS_MESSAGES.USER_UNBLOCKED);
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_UNBLOCK);
    } finally {
      setUnblockingIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const blockedUsers = blockedUsersQuery.data ?? [];
  const filteredBlockedUsers = blockedUsers.filter(
    (user_) =>
      !debouncedSearchQuery.trim() ||
      user_.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      user_.roleTag.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const notifications = notificationSettingsQuery.data ?? {
    message: true,
    connectionRequest: true,
    activity: false,
    mention: true,
    group: true,
  };

  const toggleNotification = async (key: keyof NotificationSettingsView) => {
    const newNotifs = { ...notifications, [key]: !notifications[key] };
    setUpdatingNotifKey(key);
    try {
      await updateNotificationSettingsMutation.mutateAsync(newNotifs);
      showSuccessToast(SUCCESS_MESSAGES.NOTIFICATION_SETTING_UPDATED);
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_NOTIFICATION_SETTING);
    } finally {
      setUpdatingNotifKey(null);
    }
  };

  const notificationItems = [
    { id: 'message' as const, title: 'Message notifications', subtitle: 'Get notified when you receive a message', enabled: notifications.message },
    { id: 'connectionRequest' as const, title: 'Connection request notifications', subtitle: 'Get notified about incoming requests', enabled: notifications.connectionRequest },
    { id: 'activity' as const, title: 'Activity notifications', subtitle: 'Reactions, comments on your posts', enabled: notifications.activity },
    { id: 'mention' as const, title: 'Mention notifications', subtitle: 'Get notified when someone mentions you', enabled: notifications.mention },
    { id: 'group' as const, title: 'Group notifications', subtitle: 'Get notified when someone is added to the group', enabled: notifications.group },
  ];

  const filteredNotificationItems = notificationItems.filter(
    (item) =>
      !debouncedSearchQuery.trim() ||
      item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  return (
    <div className="mhn-settings-page-root">
      <PageShell className="mhn-settings-main-container">
        <CompactPageHeader
          title="Settings"
          actions={
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
          }
        />

        <div className="mhn-settings-card-wrapper">
          <aside className="mhn-settings-sidebar">
            <Button
              onClick={() => setActiveSubTab(SettingsSubTabEnum.GENERAL)}
              className={`mhn-settings-subtab-btn justify-start ${activeSubTab === SettingsSubTabEnum.GENERAL ? 'mhn-subtab-active' : ''}`}
            >
              General
            </Button>
            <Button
              onClick={() => setActiveSubTab(SettingsSubTabEnum.NOTIFICATION)}
              className={`mhn-settings-subtab-btn justify-start ${activeSubTab === SettingsSubTabEnum.NOTIFICATION ? 'mhn-subtab-active' : ''}`}
            >
              Notification
            </Button>
            <Button
              onClick={() => setActiveSubTab(SettingsSubTabEnum.BLOCKED)}
              className={`mhn-settings-subtab-btn justify-start ${activeSubTab === SettingsSubTabEnum.BLOCKED ? 'mhn-subtab-active' : ''}`}
            >
              Blocked Users
            </Button>
          </aside>

          <section className="mhn-settings-content-area">
            {activeSubTab === SettingsSubTabEnum.NOTIFICATION && (
              <div className="mhn-notification-settings-list">
                {notificationSettingsQuery.isLoading ? (
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
                        {updatingNotifKey === item.id && <div className="mhn-spinner-mini" />}
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
                  <Input type="email" value={user?.email ?? ''} readOnly className="mhn-setting-input" />
                </div>
                <div className="mhn-general-setting-field">
                  <label className="mhn-setting-label">Primary Role</label>
                  <Input type="text" value={user?.primaryRole ?? ''} readOnly className="mhn-setting-input" />
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
                {blockedUsersQuery.isLoading ? (
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
                    icon={<Ban size={32} color="#64748B" aria-hidden="true" />}
                  />
                ) : (
                  <div className="mhn-blocked-users-grid">
                    {filteredBlockedUsers.map((blockedUser) => (
                      <div key={blockedUser.id} className="mhn-blocked-user-card">
                        <FallbackImage
                          src={blockedUser.avatarUrl}
                          alt={blockedUser.name}
                          width={56}
                          height={56}
                          className="mhn-blocked-user-avatar"
                        />
                        <h4 className="mhn-blocked-user-name">{blockedUser.name}</h4>
                        <span className="mhn-blocked-user-role">{blockedUser.roleTag}</span>

                        <div className="mhn-blocked-user-team-row">
                          <Image src={blockedUser.teamLogo} alt={blockedUser.teamName} width={14} height={14} className="mhn-blocked-team-logo" />
                          <span className="mhn-blocked-team-name">{blockedUser.teamName}</span>
                        </div>

                        <div className="mhn-blocked-user-loc-row">
                          <MapPin size={12} aria-hidden="true" />
                          <span>{blockedUser.location}</span>
                        </div>

                        <Button
                          type="button"
                          onClick={() => handleUnblock(blockedUser.id)}
                          disabled={unblockingIds.includes(blockedUser.id)}
                          className="mhn-btn-unblock mhn-btn-loading-flex"
                        >
                          {unblockingIds.includes(blockedUser.id) ? (
                            <>
                              <div className="mhn-spinner-white-mini" />
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
      </PageShell>
    </div>
  );
};
