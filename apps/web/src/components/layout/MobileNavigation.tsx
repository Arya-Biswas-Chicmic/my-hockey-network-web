import React, { useState } from 'react';
import Image from 'next/image';
import { Menu, X, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { NAVIGATION_ITEMS } from '@/constants/navigation.constants';

export interface MobileNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onCreatePostClick?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab = 'home',
  onTabChange,
  onCreatePostClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (id: string) => {
    if (onTabChange) onTabChange(id);
    setIsOpen(false);
  };

  return (
    <header className="mhn-mobile-nav-header lg:hidden">
      <div className="mhn-mobile-nav-bar">
        <div className="mhn-mobile-logo" onClick={() => handleNavClick('home')}>
          <Image src="/logo.png" alt="My Hockey Network" width={110} height={30} />
        </div>

        <div className="mhn-mobile-actions">
          <Button
            className="mhn-mobile-create-btn"
            onClick={onCreatePostClick}
            aria-label="Create Post"
          >
            <Plus size={18} />
          </Button>

          <Button
            className="mhn-mobile-menu-toggle"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="mhn-mobile-menu-drawer">
          <nav className="mhn-mobile-menu-list">
            {NAVIGATION_ITEMS.map(({ id, label, ActiveIcon, InactiveIcon }) => {
              const isActive = activeTab === id;
              const Icon = isActive ? ActiveIcon : InactiveIcon;
              return (
                <Button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={`mhn-mobile-menu-item ${isActive ? 'mhn-mobile-menu-item-active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
