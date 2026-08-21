import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { NetworkSkeletonCard } from '../components/features/network/NetworkSkeletonLoader';
import {
  getNotificationSettings,
  updateNotificationSettings,
  getBlockedUsersSettings,
  removeRelationship,
} from '@my-hockey-network/core';

interface SettingsPageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('settings');
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'notification' | 'blocked'>('blocked');
  const [searchQuery, setSearchQuery] = useState('');

  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [updatingNotifKey, setUpdatingNotifKey] = useState<string | null>(null);
  const [unblockingIds, setUnblockingIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load live blocked users from GET /v1/settings/blocked
  const fetchBlockedUsers = async (showSkeleton = true) => {
    if (showSkeleton) setIsLoadingBlocked(true);
    try {
      const res = await getBlockedUsersSettings();
      if (res && res.items && Array.isArray(res.items)) {
        const mapped = res.items.map((b: any) => {
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
    } catch (err: any) {
      console.warn('❌ [SettingsPage] getBlockedUsersSettings notice:', err?.message || err);
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
        res.items.forEach((it: any) => {
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
    } catch (err: any) {
      console.warn('❌ [SettingsPage] getNotificationSettings notice:', err?.message || err);
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
      console.log(`🚀 [SettingsPage] Unblocking user edge ID: ${userId}`);
      await removeRelationship(userId);

      // Show Toast Notification
      setToast({ message: 'User unblocked successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3500);

      // Re-fetch GET API with shimmer loader enabled
      await fetchBlockedUsers(true);
    } catch (err: any) {
      console.error('❌ [SettingsPage] Unblock Error:', err);
      setToast({ message: err?.message || 'Failed to unblock user. Please try again.', type: 'error' });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setUnblockingIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const filteredBlockedUsers = blockedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.roleTag.toLowerCase().includes(searchQuery.toLowerCase())
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

      setToast({ message: 'Notification setting updated successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3000);

      // Re-fetch GET API with shimmer loader enabled after updating settings
      await fetchNotificationSettings(true);
    } catch (err: any) {
      console.warn('❌ [SettingsPage] updateNotificationSettings notice:', err?.message || err);
      setToast({ message: 'Failed to update notification setting.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
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
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mhn-settings-page-root">
      {/* Toast Notification Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '8px',
            backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <span>{toast.message}</span>
        </div>
      )}

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
            <svg
              className="mhn-settings-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.toLowerCase().includes('notif')) {
                  setActiveSubTab('notification');
                } else if (val.toLowerCase().includes('block')) {
                  setActiveSubTab('blocked');
                } else if (val.toLowerCase().includes('email') || val.toLowerCase().includes('role') || val.toLowerCase().includes('lang')) {
                  setActiveSubTab('general');
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
            <button
              onClick={() => setActiveSubTab('general')}
              className={`mhn-settings-subtab-btn ${activeSubTab === 'general' ? 'mhn-subtab-active' : ''}`}
            >
              General
            </button>
            <button
              onClick={() => setActiveSubTab('notification')}
              className={`mhn-settings-subtab-btn ${activeSubTab === 'notification' ? 'mhn-subtab-active' : ''}`}
            >
              Notification
            </button>
            <button
              onClick={() => setActiveSubTab('blocked')}
              className={`mhn-settings-subtab-btn ${activeSubTab === 'blocked' ? 'mhn-subtab-active' : ''}`}
            >
              Blocked Users
            </button>
          </aside>

          {/* Right Content Area */}
          <section className="mhn-settings-content-area">
            {activeSubTab === 'notification' && (
              <div className="mhn-notification-settings-list">
                {isLoadingNotifications ? (
                  [1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="mhn-notification-setting-row" style={{ opacity: 0.75, alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <div style={{ width: '180px', height: '16px', borderRadius: '4px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%)', backgroundSize: '200% 100%', animation: 'mhnShimmer 1.5s infinite linear' }} />
                        <div style={{ width: '260px', height: '12px', borderRadius: '4px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%)', backgroundSize: '200% 100%', animation: 'mhnShimmer 1.5s infinite linear' }} />
                      </div>
                      <div style={{ width: '48px', height: '26px', borderRadius: '13px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%)', backgroundSize: '200% 100%', animation: 'mhnShimmer 1.5s infinite linear' }} />
                    </div>
                  ))
                ) : (
                  filteredNotificationItems.map((item) => (
                    <div key={item.id} className="mhn-notification-setting-row">
                      <div className="mhn-notification-setting-text">
                        <h4 className="mhn-notification-item-title">{item.title}</h4>
                        <p className="mhn-notification-item-subtitle">{item.subtitle}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {updatingNotifKey === item.id && (
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid rgba(15, 23, 42, 0.2)',
                              borderTopColor: '#0F172A',
                              borderRadius: '50%',
                              animation: 'mhnSpin 0.8s linear infinite',
                            }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => toggleNotification(item.id)}
                          disabled={updatingNotifKey === item.id}
                          className={`mhn-toggle-switch ${item.enabled ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                          aria-label={item.title}
                          style={{ opacity: updatingNotifKey === item.id ? 0.6 : 1 }}
                        >
                          <div className="mhn-toggle-handle" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeSubTab === 'general' && (
              <div className="mhn-general-settings-view">
                <h3 className="mhn-settings-section-heading">Account & General Settings</h3>
                <div className="mhn-general-setting-field">
                  <label className="mhn-setting-label">Email Address</label>
                  <input
                    type="email"
                    value="sakshaiukym.garg@chicmicstudios.in"
                    readOnly
                    className="mhn-setting-input"
                  />
                </div>
                <div className="mhn-general-setting-field">
                  <label className="mhn-setting-label">Primary Role</label>
                  <input
                    type="text"
                    value="PLAYER"
                    readOnly
                    className="mhn-setting-input"
                  />
                </div>
                <div className="mhn-general-setting-field">
                  <label className="mhn-setting-label">Language</label>
                  <select className="mhn-setting-select" defaultValue="en">
                    <option value="en">English (US)</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            )}

            {activeSubTab === 'blocked' && (
              <div className="mhn-blocked-users-view">
                {isLoadingBlocked ? (
                  <div className="mhn-blocked-users-grid">
                    {[1, 2, 3, 4].map((n) => (
                      <NetworkSkeletonCard key={n} />
                    ))}
                  </div>
                ) : filteredBlockedUsers.length === 0 ? (
                  <p className="mhn-settings-empty-notice">
                    {searchQuery ? `No blocked users match "${searchQuery}".` : "No blocked users found."}
                  </p>
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>{user.location}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUnblock(user.id)}
                          disabled={unblockingIds.includes(user.id)}
                          className="mhn-btn-unblock"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            opacity: unblockingIds.includes(user.id) ? 0.75 : 1,
                          }}
                        >
                          {unblockingIds.includes(user.id) ? (
                            <>
                              <div
                                style={{
                                  width: '14px',
                                  height: '14px',
                                  border: '2px solid rgba(255,255,255,0.3)',
                                  borderTopColor: '#FFFFFF',
                                  borderRadius: '50%',
                                  animation: 'mhnSpin 0.8s linear infinite',
                                }}
                              />
                              <span>Unblocking...</span>
                            </>
                          ) : (
                            'Unblock'
                          )}
                        </button>
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
