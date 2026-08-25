import { Button } from './Button';
import React from 'react';

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
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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
