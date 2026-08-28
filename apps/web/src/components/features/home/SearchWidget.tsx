import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';

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
    <div className={`mhn-feed-search-wrapper ${className}`}>
      <Search className="mhn-feed-search-icon text-muted-foreground" size={16} aria-hidden="true" />
      <Input
        type="text"
        value={value}
        disableAutoSanitize
        onValueChange={(nextValue) => onChange(nextValue)}
        placeholder={placeholder}
        aria-label="Search"
        className="mhn-feed-search-input pr-9 text-foreground placeholder:text-muted-foreground"
      />
      {value && (
        <Button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
};
