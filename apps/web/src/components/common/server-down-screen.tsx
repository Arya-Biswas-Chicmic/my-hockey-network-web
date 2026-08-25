import { Button } from './Button';
import React, { useState } from 'react';

export interface ServerDownScreenProps {
  statusCode?: number;
  message?: string;
  onRetry?: () => void;
}

export const ServerDownScreen: React.FC<ServerDownScreenProps> = ({
  statusCode = 502,
  message = 'The server is currently experiencing downtime or maintenance. Please try again shortly.',
  onRetry,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryClick = async () => {
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      } else {
        window.location.reload();
      }
    } finally {
      setTimeout(() => setIsRetrying(false), 800);
    }
  };

  return (
    <div className="mhn-server-down-overlay">
      <div className="mhn-server-down-modal">
        {/* Server Status Pill */}
        <div className="mhn-server-down-modal-status-pill">
          <span>●</span> HTTP {statusCode} SERVER OFFLINE
        </div>

        {/* Server Vector Icon with Pulse Ring */}
        <div className="mhn-server-down-modal-icon-circle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </div>

        {/* Header Title */}
        <h2 className="mhn-server-down-modal-title">
          Server Temporarily Unavailable
        </h2>

        {/* Description Body */}
        <p className="mhn-server-down-modal-description">
          {message}
        </p>

        {/* Interactive Retry Button */}
        <Button
          onClick={handleRetryClick}
          disabled={isRetrying}
          className="mhn-server-down-modal-btn"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isRetrying ? 'mhn-spin-icon' : undefined}
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          {isRetrying ? 'Reconnecting...' : 'Retry Connection'}
        </Button>
      </div>
    </div>
  );
};
