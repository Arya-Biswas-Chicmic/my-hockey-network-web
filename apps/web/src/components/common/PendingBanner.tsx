import { Button } from './Button';
import React from 'react';

interface PendingBannerProps {
  message?: string;
  actionText?: string;
  onActionClick?: () => void;
}

export const PendingBanner: React.FC<PendingBannerProps> = ({
  message = "Guardian invitation pending. Your guardian has not yet accepted your request to connect.",
  actionText = "Manage Invitations",
  onActionClick
}) => {
  return (
    <div className="mhn-pending-banner">
      <div className="mhn-pending-banner-content">
        <div className="mhn-pending-banner-icon">
           <img src="/info.png" className='info-icon'/>
        </div>
        <span className="mhn-pending-banner-text">{message}</span>
      </div>
      <Button
        onClick={onActionClick}
        className="mhn-pending-banner-action"
      >
        {actionText}
      </Button>
    </div>
  );
};
