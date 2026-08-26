import { Button } from '@/components/common/Button';
import React from 'react';
import { SearchX } from 'lucide-react';

export interface NoDataFoundProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const NoDataFound: React.FC<NoDataFoundProps> = ({
  title = 'No Data Found',
  description = 'There is currently no information available to display.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="mhn-no-data-card">
      <div className="mhn-no-data-icon-wrapper">
        {icon || (
          <SearchX size={32} strokeWidth={1.75} />
        )}
      </div>

      <h3 className="mhn-no-data-title">
        {title}
      </h3>

      <p className="mhn-no-data-description">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mhn-no-data-action-btn"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
