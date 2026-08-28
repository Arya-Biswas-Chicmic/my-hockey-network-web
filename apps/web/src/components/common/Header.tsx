import Image from 'next/image';
import { FallbackImage } from '@/components/ui/fallback-image';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LogoutModal } from '@/components/common/LogoutModal';
import { useHeaderFamily } from '@/hooks/use-header-family';
import { HeaderNavMenu } from '@/components/common/HeaderNavMenu';
import { HeaderProfileDropdown } from '@/components/common/HeaderProfileDropdown';
import { ChevronDown } from 'lucide-react';
import { useShellUiStore } from '@/stores/shell-ui-store';
import { useTheme } from '@/components/core/theme-provider';

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
}) => {
  const { user, handleLogout: contextLogout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
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

  const { activeUser, familyMembers, isFamilyLoading, isParent } = useHeaderFamily(user, userName);

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
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

        <HeaderNavMenu currentTab={currentTab} onTabClick={handleTabClick} />

        {/* Right: User Profile Dropdown */}
        <div className="mhn-header-user">
          <div className="mhn-user-profile-btn" onClick={toggleProfileMenu}>
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

          {isProfileOpen && (
            <HeaderProfileDropdown
              activeUser={activeUser}
              isParent={isParent}
              familyMembers={familyMembers}
              isFamilyLoading={isFamilyLoading}
              isFamilyExpanded={isFamilyExpanded}
              onToggleFamilyExpand={toggleFamilyExpanded}
              onSelectFamilyMember={(memberId) => onTabChange?.('supervision', { selectedWardId: memberId })}
              onShowMoreFamily={() => onTabChange?.('supervision')}
              resolvedTheme={resolvedTheme ?? 'dark'}
              onToggleTheme={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              onClose={() => setIsProfileOpen(false)}
              onNavigate={handleTabClick}
              onLogoutClick={handleLogoutClick}
            />
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
