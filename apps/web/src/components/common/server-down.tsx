import { Button } from './Button';
import React from 'react';

export interface ServerDownProps {
  title?: string;
  description?: string;
  statusCode?: number;
  onRetry?: () => void;
}

export const ServerDown: React.FC<ServerDownProps> = ({
  title = 'Server Currently Unavailable',
  description = 'We are having trouble communicating with the server. Please check your internet connection or try again shortly.',
  statusCode = 502,
  onRetry,
}) => {
  return (
    <div className="mhn-server-down-card">
      <div className="mhn-server-down-status-pill">
        <span>●</span> {statusCode} Server Error
      </div>

      <div className="mhn-server-down-icon-circle">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </div>

      <h3 className="mhn-server-down-title">
        {title}
      </h3>

      <p className="mhn-server-down-description">
        {description}
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          className="mhn-server-down-retry-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Retry Connection
        </Button>
      )}
    </div>
  );
};
