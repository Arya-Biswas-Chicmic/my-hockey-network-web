import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/use-auth';
import { LogoutModal } from '@/components/common/LogoutModal';
import { useHeaderFamily } from '@/hooks/use-header-family';
import { HeaderProfileDropdown } from '@/components/common/HeaderProfileDropdown';
import { FallbackImage } from '@/components/ui/fallback-image';
import {
  Bell,
  Bookmark,
  CalendarCheck2,
  ChevronDown,
  Home,
  MessageSquare,
  MessagesSquare,
  Plus,
  Search,
  Shield,
  User,
} from 'lucide-react';
import { useShellUiStore } from '@/stores/shell-ui-store';
import { useTheme } from '@/components/core/theme-provider';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'messaging', label: 'Messaging', Icon: MessageSquare },
  { id: 'explore', label: 'Explore', Icon: Search },
  { id: 'events', label: 'Events', Icon: CalendarCheck2 },
  { id: 'groups', label: 'Groups', Icon: MessagesSquare },
  { id: 'teams', label: 'Teams', Icon: Shield },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'saved', label: 'Saved', Icon: Bookmark },
  { id: 'profile', label: 'Profile', Icon: User },
] as const;

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string, extraData?: { selectedWardId?: string }) => void;
  onLogout?: () => void;
  onCreatePostClick?: () => void;
}

/**
 * The app's left navigation sidebar — replaces `Header`'s top nav bar per the
 * new design (dark-mode reference approved 2026-08-27; light mode is a color
 * pass on this same structure, not a new layout). Rolled out to `/home`
 * first; other authenticated routes still use `Header` until they're
 * migrated in a follow-up pass.
 */
export const Sidebar: React.FC<SidebarProps> = ({
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
        className="mhn-sidebar-logo"
        onClick={() => handleTabClick('home')}
      >
        <Image src="/logo.png" alt="My Hockey Network" width={140} height={38} className="mhn-sidebar-logo-img" />
      </div>

      <nav className="mhn-sidebar-nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <Button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`mhn-sidebar-nav-item ${activeTab === id ? 'mhn-sidebar-nav-item-active' : ''}`}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </Button>
        ))}

        <Button
          onClick={onCreatePostClick}
          className="mhn-sidebar-nav-item mhn-sidebar-create-post"
        >
          <Plus size={20} aria-hidden="true" />
          <span>Create Post</span>
        </Button>
      </nav>

      <div className="mhn-sidebar-footer">
        <div className="mhn-sidebar-user-chip" onClick={toggleProfileMenu}>
          <div className="mhn-sidebar-user-avatar">
            <FallbackImage src={activeUser.avatar} alt={activeUser.name} fill className="mhn-avatar-img" />
          </div>
          <span className="mhn-sidebar-user-name">{activeUser.name}</span>
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
