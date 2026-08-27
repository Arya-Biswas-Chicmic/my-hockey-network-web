import React from 'react';
import { HomeFeedTab } from '@/types/home.types';
import { HOME_FEED_TABS } from '@/constants/home.constants';

export interface HomeTabsProps {
  activeTab: HomeFeedTab;
  onChange: (tab: HomeFeedTab) => void;
}

export const HomeTabs: React.FC<HomeTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div className="mhn-feed-scope-tabs flex items-center justify-around gap-8 mb-5 pt-1 px-4" role="tablist" aria-label="Home Feed Categories">
      {HOME_FEED_TABS.map((scope) => {
        const isActive = activeTab === scope.key;
        return (
          <button
            key={scope.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(scope.key)}
            className={`mhn-feed-scope-tab relative text-sm transition-colors outline-none py-1.5 px-2 ${
              isActive
                ? 'mhn-feed-scope-tab-active text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <span>{scope.label}</span>
            {isActive && (
              <span className="absolute -bottom-1 left-1 right-1 h-[3px] rounded-full bg-blue-500" />
            )}
          </button>
        );
      })}
    </div>
  );
};
