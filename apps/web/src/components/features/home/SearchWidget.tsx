import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/common/FormControls';
import { Button } from '@/components/common/Button';

export interface SearchWidgetProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({
  value,
  onChange,
  placeholder = 'Search',
  className = '',
}) => {
  return (
    <div className={`mhn-feed-search-wrapper relative flex items-center mb-4 ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
      <Input
        type="text"
        value={value}
        onValueChange={(nextValue) => onChange(nextValue)}
        placeholder={placeholder}
        aria-label="Search"
        disableAutoSanitize
        className="w-full rounded-xl border border-slate-800/80 bg-slate-900/60 py-2.5 pl-10 pr-9 text-xs text-slate-100 placeholder-slate-400 outline-none transition-colors focus:border-slate-700 focus:bg-slate-900"
      />
      {value && (
        <Button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          aria-label="Clear search"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
};
