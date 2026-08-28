'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Menu, X, Plus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import {
  getNavigationItemById,
  isNavigationItemActive,
  NAVIGATION_ITEMS,
} from '@/constants/navigation.constants';

export interface MobileNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onCreatePostClick?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onTabChange,
  onCreatePostClick,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (id: string) => {
    if (onTabChange) {
      onTabChange(id);
    } else {
      const item = getNavigationItemById(id);
      if (item) router.push(item.route);
    }
    setIsOpen(false);
  };

  return (
    <header className="mhn-mobile-nav-header lg:hidden">
      <div className="mhn-mobile-nav-bar">
        <Button
          type="button"
          className="mhn-mobile-logo"
          onClick={() => handleNavClick('home')}
          aria-label="Go to Home"
        >
          {/* Only a dark-background logo exists today (`apps/web/public/dark/logo.webp`,
              white wordmark) — `.mhn-mobile-nav-header` has no CSS of its own, so its
              background isn't confirmed theme-fixed the way `.mhn-header`'s hardcoded
              gradient is. Once a light-theme logo variant is supplied
              (`apps/web/public/light/logo.webp`), swap this to
              `themedImageSrc('logo', resolvedTheme)` from `@/utils/themedImage`. */}
          <Image src="/dark/logo.webp" alt="My Hockey Network" width={110} height={30} />
        </Button>

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
            {NAVIGATION_ITEMS.map((item) => {
              const { id, label, ActiveIcon, InactiveIcon } = item;
              const isActive = isNavigationItemActive(pathname, item);
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
