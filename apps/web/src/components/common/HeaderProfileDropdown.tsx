import { Button } from '@/components/common/Button';
import { FallbackImage } from '@/components/ui/fallback-image';
import { HeaderFamilyMenu, type FamilyMember } from '@/components/common/HeaderFamilyMenu';
import { ChevronRight, Eye, HelpCircle, LogOut, Moon, Settings, Sun } from 'lucide-react';

export interface HeaderProfileDropdownProps {
  activeUser: { name: string; avatar: string };
  isParent: boolean;
  familyMembers: FamilyMember[];
  isFamilyLoading: boolean;
  isFamilyExpanded: boolean;
  onToggleFamilyExpand: () => void;
  onSelectFamilyMember: (memberId: string) => void;
  onShowMoreFamily: () => void;
  resolvedTheme: string;
  onToggleTheme: () => void;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onLogoutClick: () => void;
}

/** Header's profile-avatar dropdown popover: View Profile, the Family
 * switcher (parents only), Settings, theme toggle, Supervision (parents
 * only), Help, and Logout. Extracted from `components/common/Header.tsx`. */
export function HeaderProfileDropdown({
  activeUser,
  isParent,
  familyMembers,
  isFamilyLoading,
  isFamilyExpanded,
  onToggleFamilyExpand,
  onSelectFamilyMember,
  onShowMoreFamily,
  resolvedTheme,
  onToggleTheme,
  onClose,
  onNavigate,
  onLogoutClick,
}: Readonly<HeaderProfileDropdownProps>) {
  const navigateAndClose = (tab: string) => {
    onClose();
    onNavigate(tab);
  };

  return (
    <>
      <div className="mhn-dropdown-backdrop" onClick={onClose} />

      <div className="mhn-profile-dropdown">
        <Button className="mhn-dropdown-item" onClick={() => navigateAndClose('profile')}>
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
          <ChevronRight className="mhn-dropdown-chevron" size={16} aria-hidden="true" />
        </Button>

        {isParent && (
          <HeaderFamilyMenu
            familyMembers={familyMembers}
            isFamilyLoading={isFamilyLoading}
            isExpanded={isFamilyExpanded}
            onToggleExpand={onToggleFamilyExpand}
            onSelectMember={(memberId) => {
              onClose();
              onSelectFamilyMember(memberId);
            }}
            onShowMore={() => {
              onClose();
              onShowMoreFamily();
            }}
          />
        )}

        <Button className="mhn-dropdown-item" onClick={() => navigateAndClose('settings')}>
          <div className="mhn-dropdown-item-left">
            <div className="mhn-dropdown-icon-box">
              <Settings size={18} aria-hidden="true" />
            </div>
            <span className="mhn-dropdown-item-text">Settings & Privacy</span>
          </div>
          <ChevronRight className="mhn-dropdown-chevron" size={16} aria-hidden="true" />
        </Button>

        <Button
          className="mhn-dropdown-item"
          onClick={onToggleTheme}
          aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <div className="mhn-dropdown-item-left">
            <div className="mhn-dropdown-icon-box">
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </div>
            <span className="mhn-dropdown-item-text">
              {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          </div>
          <ChevronRight className="mhn-dropdown-chevron" size={16} aria-hidden="true" />
        </Button>

        {/* Parent-only management route. Child approvals stay under Profile. */}
        {isParent && (
          <Button className="mhn-dropdown-item" onClick={() => navigateAndClose('supervision')}>
            <div className="mhn-dropdown-item-left">
              <div className="mhn-dropdown-icon-box">
                <Eye size={18} aria-hidden="true" />
              </div>
              <span className="mhn-dropdown-item-text">Supervision</span>
            </div>
            <ChevronRight className="mhn-dropdown-chevron" size={16} aria-hidden="true" />
          </Button>
        )}

        <Button className="mhn-dropdown-item" onClick={() => navigateAndClose('help')}>
          <div className="mhn-dropdown-item-left">
            <div className="mhn-dropdown-icon-box">
              <HelpCircle size={18} aria-hidden="true" />
            </div>
            <span className="mhn-dropdown-item-text">Help & Support</span>
          </div>
          <ChevronRight className="mhn-dropdown-chevron" size={16} aria-hidden="true" />
        </Button>

        <div className="mhn-dropdown-divider" />

        <Button className="mhn-dropdown-logout-btn" onClick={onLogoutClick}>
          <div className="mhn-logout-icon-box">
            <LogOut size={16} aria-hidden="true" />
          </div>
          <span className="mhn-logout-text">Logout</span>
        </Button>
      </div>
    </>
  );
}
