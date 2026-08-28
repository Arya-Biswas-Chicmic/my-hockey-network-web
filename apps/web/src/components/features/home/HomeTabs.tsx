import React from 'react';
import { Button } from '@/components/common/Button';
import { HomeFeedTab } from '@/types/home.types';
import { HOME_FEED_TABS } from '@/constants/home.constants';

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
}

export interface CategoryTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
}

export const CategoryTabs = <T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: CategoryTabsProps<T>) => {
  return (
    <div
      className={`mhn-feed-scope-tabs flex items-center ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`mhn-feed-scope-tab text-sm font-semibold transition-colors outline-none ${
              isActive ? 'mhn-feed-scope-tab-active text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export interface HomeTabsProps {
  activeTab: HomeFeedTab;
  onChange: (tab: HomeFeedTab) => void;
}

export const HomeTabs: React.FC<HomeTabsProps> = ({ activeTab, onChange }) => {
  return (
    <CategoryTabs
      tabs={HOME_FEED_TABS}
      activeTab={activeTab}
      onChange={onChange}
    />
  );
};
