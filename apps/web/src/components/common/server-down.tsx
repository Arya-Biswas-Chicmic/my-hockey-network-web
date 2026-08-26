import { Button } from '@/components/common/Button';
import React from 'react';
import { RefreshCw, ServerCrash } from 'lucide-react';

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
        <ServerCrash size={32} />
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
          <RefreshCw size={16} strokeWidth={2.5} />
          Retry Connection
        </Button>
      )}
    </div>
  );
};
