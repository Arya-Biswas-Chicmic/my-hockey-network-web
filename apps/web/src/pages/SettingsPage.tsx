import React, { useState } from 'react';
import { Header } from '../components/common/Header';

interface SettingsPageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('settings');
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'notification' | 'blocked'>('blocked');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Blocked Users matching Figma Screenshot
  const [blockedUsers, setBlockedUsers] = useState([
    {
      id: 'b1',
      name: 'Connor McDavid',
      roleTag: 'C • #97',
      avatarUrl: '/userPlaceholder.png',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
    },
    {
      id: 'b2',
      name: 'Lucas Bennett',
      roleTag: 'Fwd/Def • #88 AAA',
      avatarUrl: '/player.png',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
    },
    {
      id: 'b3',
      name: 'Columbus Blue',
      roleTag: 'Team',
      avatarUrl: '/columbus.png',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
    },
    {
      id: 'b4',
      name: 'Jack Hughes',
      roleTag: 'C • #86',
      avatarUrl: '/jack.png',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
    },
  ]);

  const handleUnblock = (userId: string) => {
    setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
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

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
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
                {filteredNotificationItems.map((item) => (
                  <div key={item.id} className="mhn-notification-setting-row">
                    <div className="mhn-notification-setting-text">
                      <h4 className="mhn-notification-item-title">{item.title}</h4>
                      <p className="mhn-notification-item-subtitle">{item.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleNotification(item.id)}
                      className={`mhn-toggle-switch ${item.enabled ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                      aria-label={item.title}
                    >
                      <div className="mhn-toggle-handle" />
                    </button>
                  </div>
                ))}
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
                {filteredBlockedUsers.length === 0 ? (
                  <p className="mhn-settings-empty-notice">
                    {searchQuery ? `No blocked users match "${searchQuery}".` : "You have not blocked any users in your hockey network."}
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
                          className="mhn-btn-unblock"
                        >
                          Unblock
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
