import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/use-auth';
import { LogoutModal } from '@/components/common/LogoutModal';
import { useHeaderFamily } from '@/hooks/use-header-family';
import { HeaderProfileDropdown } from '@/components/common/HeaderProfileDropdown';
import { FallbackImage } from '@/components/ui/fallback-image';
import { NAVIGATION_ITEMS, NavigationItemConfig } from '@/constants/navigation.constants';
import { SidebarCreatePostIcon, SidebarMoreIcon } from '@/components/icons/SidebarIcons';
import { useShellUiStore } from '@/stores/shell-ui-store';
import { useTheme } from '@/components/core/theme-provider';

export interface LeftSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string, extraData?: { selectedWardId?: string }) => void;
  onLogout?: () => void;
  onCreatePostClick?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab = 'home',
  onTabChange,
  onLogout,
  onCreatePostClick,
}) => {
  const { user, handleLogout: contextLogout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
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

  const { activeUser, familyMembers, isFamilyLoading, isParent } = useHeaderFamily(user);

  const handleTabClick = (tabId: string) => {
    if (onTabChange) onTabChange(tabId);
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
      if (onLogout) onLogout();
    }
  };

  return (
    <aside className="mhn-sidebar">
      <div
        className="mhn-sidebar-logo mhn-cursor-pointer"
        onClick={() => handleTabClick('home')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleTabClick('home')}
        aria-label="Go to Home"
      >
        <Image src="/logo.png" alt="My Hockey Network" width={140} height={38} className="mhn-sidebar-logo-img" />
      </div>

      <nav className="mhn-sidebar-nav" aria-label="Main Navigation">
        {NAVIGATION_ITEMS.map(({ id, label, ActiveIcon, InactiveIcon }: NavigationItemConfig) => {
          const isActive = activeTab === id;
          const Icon = isActive ? ActiveIcon : InactiveIcon;
          return (
            <Button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`mhn-sidebar-nav-item ${isActive ? 'mhn-sidebar-nav-item-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} aria-hidden={true} />
              <span>{label}</span>
            </Button>
          );
        })}

        <Button
          onClick={onCreatePostClick}
          className="mhn-sidebar-nav-item mhn-sidebar-create-post"
          aria-label="Create Post"
        >
          <SidebarCreatePostIcon size={20} aria-hidden={true} />
          <span>Create Post</span>
        </Button>
      </nav>

      <div className="mhn-sidebar-footer">
        <div
          className="mhn-sidebar-user-chip"
          onClick={toggleProfileMenu}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleProfileMenu()}
          aria-label="User Profile Menu"
        >
          <div className="mhn-sidebar-user-avatar">
            <FallbackImage src={activeUser.avatar} alt={activeUser.name} fill className="mhn-avatar-img" />
          </div>
          <span className="mhn-sidebar-user-name">{activeUser.name}</span>
          <SidebarMoreIcon className="mhn-user-chevron" size={16} aria-hidden={true} />
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
            resolvedTheme={resolvedTheme}
            onToggleTheme={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            onClose={() => setIsProfileOpen(false)}
            onNavigate={handleTabClick}
            onLogoutClick={handleLogoutClick}
          />
        )}
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </aside>
  );
};
