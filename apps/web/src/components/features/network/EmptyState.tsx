import { Button } from '@/components/common/Button';
import React from 'react';
import { AlertCircle, CalendarDays, FileText, Mail, Search, ServerCrash, Users } from 'lucide-react';

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
        return <ServerCrash size={28} color="#DC2626" aria-hidden="true" />;
      case 'connections':
      case 'people':
        return <Users size={28} color="#1860C3" aria-hidden="true" />;
      case 'search':
        return <Search size={28} color="#1860C3" aria-hidden="true" />;
      case 'posts':
        return <FileText size={28} color="#1860C3" aria-hidden="true" />;
      case 'events':
        return <CalendarDays size={28} color="#1860C3" aria-hidden="true" />;
      case 'nodata':
        return <AlertCircle size={28} color="#64748B" aria-hidden="true" />;
      case 'invitations':
      default:
        return <Mail size={28} color="#1860C3" aria-hidden="true" />;
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
