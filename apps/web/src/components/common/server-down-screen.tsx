import { Button } from '@/components/common/Button';
import React, { useState } from 'react';
import { RefreshCw, ServerCrash } from 'lucide-react';

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
          <ServerCrash size={40} />
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
          <RefreshCw size={18} strokeWidth={2.5} className={isRetrying ? 'mhn-spin-icon' : undefined} />
          {isRetrying ? 'Reconnecting...' : 'Retry Connection'}
        </Button>
      </div>
    </div>
  );
};
