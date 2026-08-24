import { Button } from './Button';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { LogoutModal } from './LogoutModal';
import { resolveMediaUrl } from '../../utils/mediaUtils';
import { getSupervisionData } from '@my-hockey-network/core';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
  userName?: string;
  userAvatar?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'home',
  onTabChange,
  onLogout,
  userName,
  userAvatar,
}) => {
  const { user, showToast, handleLogout: contextLogout } = useAuth();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFamilyExpanded, setIsFamilyExpanded] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const resolvedName = user?.profile?.displayName || (user as any)?.displayName || userName || 'Player';
  const rawAvatar = user?.profile?.avatarUrl || (user as any)?.avatarUrl;
  const resolvedAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');
  const [activeUser, setActiveUser] = useState({ name: resolvedName, avatar: resolvedAvatar });
  const [familyMembers, setFamilyMembers] = useState<Array<{ id: string; name: string; avatar: string }>>([
    { id: 'w1', name: 'Steve', avatar: '/jack.png' },
    { id: 'w2', name: 'David', avatar: '/lucas.png' },
  ]);

  React.useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    const name = user?.profile?.displayName || (user as any)?.displayName || userName || 'Player';
    const av = user?.profile?.avatarUrl || (user as any)?.avatarUrl;
    const avatar = resolveMediaUrl(av, '/userPlaceholder.png');
    setActiveUser({ name, avatar });
  }, [user, userName]);

  React.useEffect(() => {
    const isParent = user?.primaryRole === 'PARENT' || user?.roleAssignments?.some((r: any) => r.role === 'PARENT');
    if (isParent) {
      getSupervisionData()
        .then((data: any) => {
          const children = data?.children || data?.data?.children || [];
          if (Array.isArray(children) && children.length > 0) {
            const mapped = children.map((c: any) => ({
              id: c.userId || c.profileId || c.id || c.displayName,
              name: c.displayName || c.firstName || c.name || 'Child',
              avatar: resolveMediaUrl(c.avatarUrl, c.avatar || '/userPlaceholder.png'),
            }));
            setFamilyMembers(mapped);
          }
        })
        .catch(() => {
          // Retain default fallback
        });
    }
  }, [user]);

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const handleViewProfile = () => {
    setIsProfileOpen(false);
    handleTabClick('profile');
  };

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await contextLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      if (onLogout) {
        onLogout();
      }
    }
  };

  const handleSwitchUser = (name: string, avatar: string) => {
    setActiveUser({ name, avatar });
  };

  return (
    <header className="mhn-header">
      <div className="mhn-header-container">
        {/* Left: Brand Logo */}
        <div className="mhn-header-logo-area">
          <div className="mhn-logo-badge" onClick={() => handleTabClick('home')} style={{ cursor: 'pointer' }}>
            <div className="mhn-logo-stick-icon">
              <img src="/logo.png" className='logo' />
            </div>
          </div>
        </div>

        {/* Center: Navigation Menu */}
        <nav className="mhn-header-nav">
          {/* Home */}
          <Button
            onClick={() => handleTabClick('home')}
            className={`mhn-nav-item ${currentTab === 'home' ? 'mhn-nav-item-active' : ''}`}
          >
            <div className="mhn-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="mhn-nav-label">Home</span>
            {currentTab === 'home' && <div className="mhn-nav-active-bar" />}
          </Button>

          {/* My Network */}
          <Button
            onClick={() => handleTabClick('network')}
            className={`mhn-nav-item ${currentTab === 'network' ? 'mhn-nav-item-active' : ''}`}
          >
            <div className="mhn-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="mhn-nav-label">My Network</span>
            {currentTab === 'network' && <div className="mhn-nav-active-bar" />}
          </Button>

          {/* Events */}
          <Button
            onClick={() => handleTabClick('events')}
            className={`mhn-nav-item ${currentTab === 'events' ? 'mhn-nav-item-active' : ''}`}
          >
            <div className="mhn-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
              </svg>
            </div>
            <span className="mhn-nav-label">Events</span>
            {currentTab === 'events' && <div className="mhn-nav-active-bar" />}
          </Button>

          {/* Messaging */}
          <Button
            onClick={() => handleTabClick('messaging')}
            className={`mhn-nav-item ${currentTab === 'messaging' ? 'mhn-nav-item-active' : ''}`}
          >
            <div className="mhn-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="mhn-nav-label">Messaging</span>
            {currentTab === 'messaging' && <div className="mhn-nav-active-bar" />}
          </Button>

          {/* Notifications */}
          <Button
            onClick={() => handleTabClick('notifications')}
            className={`mhn-nav-item ${currentTab === 'notifications' ? 'mhn-nav-item-active' : ''}`}
          >
            <div className="mhn-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <span className="mhn-nav-label">Notifications</span>
            {currentTab === 'notifications' && <div className="mhn-nav-active-bar" />}
          </Button>
        </nav>

        {/* Right: User Profile Dropdown */}
        <div className="mhn-header-user">
          <div
            className="mhn-user-profile-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="mhn-user-avatar-circle">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="mhn-avatar-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                }}
              />
            </div>
            <span className="mhn-user-name">{activeUser.name}</span>
            <svg
              className={`mhn-user-chevron ${isProfileOpen ? 'mhn-chevron-rotated' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Profile Dropdown Popover */}
          {isProfileOpen && (
            <>
              {/* Backdrop click dismiss */}
              <div className="mhn-dropdown-backdrop" onClick={() => setIsProfileOpen(false)} />

              <div className="mhn-profile-dropdown">
                {/* View Profile */}
                <Button className="mhn-dropdown-item" onClick={handleViewProfile}>
                  <div className="mhn-dropdown-item-left">
                    <img 
                      src={activeUser.avatar} 
                      alt={activeUser.name} 
                      className="mhn-dropdown-avatar-img" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                      }}
                    />
                    <span className="mhn-dropdown-item-text">View Profile</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Button>

                {/* Dynamic Family Members Box */}
                {familyMembers.length > 0 && (
                  <div className="mhn-dropdown-family-box">
                    <div
                      className="mhn-family-header"
                      onClick={() => setIsFamilyExpanded(!isFamilyExpanded)}
                    >
                      <div className="mhn-dropdown-item-left">
                        <div className="mhn-family-icon-box">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <span className="mhn-dropdown-item-text">Family ({familyMembers.length})</span>
                      </div>
                      <svg className={`mhn-family-chevron ${isFamilyExpanded ? 'mhn-chevron-rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>

                    {isFamilyExpanded && (
                      <div className="mhn-family-list">
                        {familyMembers.map((member) => (
                          <div
                            key={member.id}
                            className="mhn-family-member-item"
                            onClick={() => handleSwitchUser(member.name, member.avatar)}
                          >
                            <div className="mhn-dropdown-item-left">
                              <img src={member.avatar} alt={member.name} className="mhn-family-member-img" />
                              <span className="mhn-family-member-name">{member.name}</span>
                            </div>
                            <div className="mhn-family-switch-btn" title={`Switch to ${member.name}`}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings & Privacy */}
                <Button className="mhn-dropdown-item" onClick={() => { setIsProfileOpen(false); handleTabClick('settings'); }}>
                  <div className="mhn-dropdown-item-left">
                    <div className="mhn-dropdown-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </div>
                    <span className="mhn-dropdown-item-text">Settings & Privacy</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Button>

                {/* Supervision */}
                <Button
                  className="mhn-dropdown-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    const isParent = user?.primaryRole === 'PARENT' || user?.roleAssignments?.some((r: any) => r.role === 'PARENT');
                    if (!isParent) {
                      showToast('Supervision is only available for Parent / Guardian accounts.', 'info');
                      return;
                    }
                    handleTabClick('supervision');
                  }}
                >
                  <div className="mhn-dropdown-item-left">
                    <div className="mhn-dropdown-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                    <span className="mhn-dropdown-item-text">Supervision</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Button>

                {/* Help & Support */}
                <Button className="mhn-dropdown-item" onClick={() => setIsProfileOpen(false)}>
                  <div className="mhn-dropdown-item-left">
                    <div className="mhn-dropdown-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <span className="mhn-dropdown-item-text">Help & Support</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Button>

                <div className="mhn-dropdown-divider" />

                {/* Logout Button */}
                <Button className="mhn-dropdown-logout-btn" onClick={handleLogoutClick}>
                  <div className="mhn-logout-icon-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </div>
                  <span className="mhn-logout-text">Logout</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </header>
  );
};

