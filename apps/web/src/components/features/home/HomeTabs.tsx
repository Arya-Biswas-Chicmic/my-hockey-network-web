import React from 'react';
import { Button } from '@/components/common/Button';
import { HomeFeedTab } from '@/types/home.types';
import { HOME_FEED_TABS } from '@/constants/home.constants';

export interface HomeTabsProps {
  activeTab: HomeFeedTab;
  onChange: (tab: HomeFeedTab) => void;
}

export const HomeTabs: React.FC<HomeTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div
      className="mhn-feed-scope-tabs flex items-center justify-center gap-14 border-b border-[#182740] pb-2 mb-6"
      role="tablist"
      aria-label="Home Feed Categories"
    >
      {HOME_FEED_TABS.map((scope) => {
        const isActive = activeTab === scope.key;
        return (
          <Button
            key={scope.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(scope.key)}
            className={`mhn-feed-scope-tab relative text-sm font-semibold transition-colors outline-none pb-2 ${
              isActive
                ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{scope.label}</span>
            {isActive && (
              <span className="absolute -bottom-1 left-1 right-1 h-[3px] rounded-full bg-blue-500" />
            )}
          </Button>
        );
      })}
    </div>
  );
};

