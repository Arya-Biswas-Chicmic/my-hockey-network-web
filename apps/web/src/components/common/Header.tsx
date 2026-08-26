import { Button } from '@/components/common/Button';
import Image from 'next/image';
import { FallbackImage } from '@/components/ui/fallback-image';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LogoutModal } from '@/components/common/LogoutModal';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { getSupervisionData } from '@my-hockey-network/core';
import { QueryKeys } from '@my-hockey-network/contracts';
import { isParentUser } from '@my-hockey-network/domain';
import { useQuery } from '@/query';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Eye,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import { useShellUiStore } from '@/stores/shell-ui-store';


interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string, extraData?: { selectedWardId?: string }) => void;
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
  const { user, handleLogout: contextLogout } = useAuth();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const {
    isProfileMenuOpen: isProfileOpen,
    isFamilyExpanded,
    isLogoutModalOpen,
    setProfileMenuOpen: setIsProfileOpen,
    toggleProfileMenu,
    toggleFamilyExpanded,
    setLogoutModalOpen: setIsLogoutModalOpen,
  } = useShellUiStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const resolvedName = user?.profile?.displayName || userName || 'Player';
  const rawAvatar = user?.profile?.avatarUrl;
  const resolvedAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');
  const [activeUser, setActiveUser] = useState({ name: resolvedName, avatar: resolvedAvatar });
  const [familyMembers, setFamilyMembers] = useState<Array<{ id: string; name: string; avatar: string }>>([]);
  const isParent = isParentUser(user);

  const { data: supervisionData, isLoading: isFamilyLoading } = useQuery(
    isParent ? QueryKeys.SUPERVISION_DATA : null,
    isParent ? getSupervisionData : null,
    { staleTime: 5 * 60 * 1000 }
  );

  React.useEffect(() => {
    const name = user?.profile?.displayName || userName || 'Player';
    const av = user?.profile?.avatarUrl;
    const avatar = resolveMediaUrl(av, '/userPlaceholder.png');
    setActiveUser({ name, avatar });
  }, [user, userName]);

  React.useEffect(() => {
    if (isParent && supervisionData) {
      const children = supervisionData.children;
      if (Array.isArray(children) && children.length > 0) {
        const mapped = children.map((child) => ({
          id: child.id,
          name: child.displayName || child.firstName || 'Child',
          avatar: resolveMediaUrl(child.avatarUrl, '/userPlaceholder.png'),
        }));
        setFamilyMembers(mapped);
      } else {
        setFamilyMembers([]);
      }
    } else {
      setFamilyMembers([]);
    }
  }, [isParent, supervisionData]);

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
          <div className="mhn-logo-badge mhn-header-logo-badge" onClick={() => handleTabClick('home')}>
            <div className="mhn-logo-stick-icon">
              <Image src="/logo.png" alt="My Hockey Network" width={161} height={43} className='logo' />
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
              <Home size={20} />
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
              <Users size={20} />
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
              <CalendarDays size={20} />
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
              <MessageSquare size={20} />
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
              <Bell size={20} />
            </div>
            <span className="mhn-nav-label">Notifications</span>
            {currentTab === 'notifications' && <div className="mhn-nav-active-bar" />}
          </Button>
        </nav>

        {/* Right: User Profile Dropdown */}
        <div className="mhn-header-user">
          <div
            className="mhn-user-profile-btn"
            onClick={toggleProfileMenu}
          >
            <div className="mhn-user-avatar-circle">
              <FallbackImage
                src={activeUser.avatar}
                alt={activeUser.name}
                fill
                className="mhn-avatar-img"
              />
            </div>
            <span className="mhn-user-name">{activeUser.name}</span>
            <ChevronDown
              className={`mhn-user-chevron ${isProfileOpen ? 'mhn-chevron-rotated' : ''}`}
              size={16}
            />
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
                    <FallbackImage
                      src={activeUser.avatar}
                      alt={activeUser.name}
                      width={32}
                      height={32}
                      className="mhn-dropdown-avatar-img"
                    />
                    <span className="mhn-dropdown-item-text">View Profile</span>
                  </div>
                  <ChevronRight size={16} color="#64748B" />
                </Button>

                {/* Dynamic Family Members Box */}
                {(isFamilyLoading || familyMembers.length > 0) && (
                  <div className="mhn-dropdown-family-box">
                    <div
                      className="mhn-family-header"
                      onClick={toggleFamilyExpanded}
                    >
                      <div className="mhn-dropdown-item-left">
                        <div className="mhn-family-icon-box">
                          <Users size={18} color="#1860C3" />
                        </div>
                        <span className="mhn-dropdown-item-text">
                          Family {isFamilyLoading ? '...' : `(${familyMembers.length})`}
                        </span>
                      </div>
                      <ChevronDown className={`mhn-family-chevron ${isFamilyExpanded ? 'mhn-chevron-rotated' : ''}`} size={16} color="#64748B" />
                    </div>

                    {isFamilyExpanded && (
                      <div className="mhn-family-list">
                        {isFamilyLoading ? (
                          <div className="mhn-family-skeleton-container">
                            <div className="mhn-family-skeleton-item" />
                            <div className="mhn-family-skeleton-item" />
                          </div>
                        ) : (
                          <>
                            {familyMembers.slice(0, 3).map((member) => (
                              <div
                                key={member.id}
                                className="mhn-family-member-item mhn-family-member-item-clickable"
                                onClick={() => {
                                  setIsProfileOpen(false);
                                  if (onTabChange) {
                                    onTabChange('supervision', { selectedWardId: member.id });
                                  }
                                }}
                              >
                                <div className="mhn-dropdown-item-left mhn-family-member-left">
                                  <FallbackImage src={member.avatar} alt={member.name} width={28} height={28} className="mhn-family-member-img" />
                                  <span className="mhn-family-member-name" title={member.name}>
                                    {member.name.length > 18 ? `${member.name.trim().split(/\s+/).slice(0, 2).join(' ')}...` : member.name}
                                  </span>
                                </div>
                                <div className="mhn-family-switch-btn" title={`View ${member.name} in Supervision`}>
                                  <ChevronRight size={16} color="#0F172A" />
                                </div>
                              </div>
                            ))}
                            {familyMembers.length > 3 && (
                              <div
                                className="mhn-family-show-more-item mhn-family-show-more-btn"
                                onClick={() => {
                                  setIsProfileOpen(false);
                                  if (onTabChange) {
                                    onTabChange('supervision');
                                  }
                                }}
                              >
                                <span>Show More ({familyMembers.length - 3})</span>
                                <ChevronRight size={14} color="#0B66C2" strokeWidth={2.5} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings & Privacy */}
                <Button className="mhn-dropdown-item" onClick={() => { setIsProfileOpen(false); handleTabClick('settings'); }}>
                  <div className="mhn-dropdown-item-left">
                    <div className="mhn-dropdown-icon-box">
                      <Settings size={18} color="#1860C3" />
                    </div>
                    <span className="mhn-dropdown-item-text">Settings & Privacy</span>
                  </div>
                  <ChevronRight size={16} color="#64748B" />
                </Button>

                {/* Parent-only management route. Child approvals stay under Profile. */}
                {isParent && (
                  <Button
                    className="mhn-dropdown-item"
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleTabClick('supervision');
                    }}
                  >
                    <div className="mhn-dropdown-item-left">
                      <div className="mhn-dropdown-icon-box">
                        <Eye size={18} color="#1860C3" />
                      </div>
                      <span className="mhn-dropdown-item-text">Supervision</span>
                    </div>
                    <ChevronRight size={16} color="#64748B" />
                  </Button>
                )}

                {/* Help & Support */}
                <Button className="mhn-dropdown-item" onClick={() => { setIsProfileOpen(false); handleTabClick('help'); }}>
                  <div className="mhn-dropdown-item-left">
                    <div className="mhn-dropdown-icon-box">
                      <HelpCircle size={18} color="#1860C3" />
                    </div>
                    <span className="mhn-dropdown-item-text">Help & Support</span>
                  </div>
                  <ChevronRight size={16} color="#64748B" />
                </Button>

                <div className="mhn-dropdown-divider" />

                {/* Logout Button */}
                <Button className="mhn-dropdown-logout-btn" onClick={handleLogoutClick}>
                  <div className="mhn-logout-icon-box">
                    <LogOut size={16} color="#DC2626" />
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
