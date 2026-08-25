import { Button } from '../../common/Button';
import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  iconType?: 'invitations' | 'people' | 'connections' | 'search' | 'nodata' | 'posts' | 'events' | 'server-error';
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  message = 'There are currently no items to display in this view.',
  iconType = 'invitations',
  actionLabel,
  onAction,
}) => {
  const renderIcon = () => {
    switch (iconType) {
      case 'server-error':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
            <line x1="12" y1="6" x2="18" y2="6" />
            <line x1="12" y1="18" x2="18" y2="18" />
            <circle cx="18" cy="12" r="3" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
            <line x1="18" y1="11" x2="18" y2="12.5" stroke="#DC2626" strokeWidth="1.5" />
            <line x1="18" y1="13.5" x2="18" y2="13.6" stroke="#DC2626" strokeWidth="2" />
          </svg>
        );
      case 'connections':
      case 'people':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'search':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        );
      case 'posts':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case 'events':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'nodata':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="17" />
          </svg>
        );
      case 'invitations':
      default:
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        );
    }
  };

  const isServerError = iconType === 'server-error';
  const isNoData = iconType === 'nodata';

  return (
    <div
      className={`mhn-empty-state-card ${isServerError ? 'mhn-server-error-border' : ''}`}
    >
      <div
        className={`mhn-empty-state-icon-wrapper ${isServerError ? 'mhn-icon-server-error' : isNoData ? 'mhn-icon-nodata' : ''}`}
      >
        {renderIcon()}
      </div>
      <div>
        <h4
          className="mhn-empty-state-title"
        >
          {title}
        </h4>
        <p
          className="mhn-empty-state-message"
        >
          {message}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mhn-empty-state-btn"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
