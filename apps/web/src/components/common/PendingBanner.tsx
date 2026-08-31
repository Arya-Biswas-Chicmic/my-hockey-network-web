import { Button } from '@/components/common/Button';
import Image from 'next/image';
import React from 'react';

interface PendingBannerProps {
  message?: string;
  actionText?: string;
  onActionClick?: () => void;
}

export const PendingBanner: React.FC<PendingBannerProps> = ({
  message = "Guardian invitation pending. Your guardian has not yet accepted your request to connect.",
  actionText,
  onActionClick
}) => {
  // Some states are purely informational — a parent-disabled supervision
  // control is not something the child can act on — so the banner renders as a
  // notice with no button rather than offering an action that leads nowhere.
  const hasAction = Boolean(actionText && onActionClick);

  return (
    <div className="mhn-pending-banner">
      <div className="mhn-pending-banner-content">
        <div className="mhn-pending-banner-icon">
           <Image src="/info.webp" alt="" width={20} height={20} className='info-icon'/>
        </div>
        <span className="mhn-pending-banner-text">{message}</span>
      </div>
      {hasAction && (
        <Button
          onClick={onActionClick}
          className="mhn-pending-banner-action"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};
