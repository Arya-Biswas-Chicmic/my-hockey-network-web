import { Button } from '@/components/common/Button';
import Image from 'next/image';
import React from 'react';

interface InviteGrowWidgetProps {
  onInviteClick?: () => void;
  illustrationUrl?: string;
}

export const InviteGrowWidget: React.FC<InviteGrowWidgetProps> = ({
  onInviteClick,
  illustrationUrl = '/InviteGrow.png'
}) => {
  return (
    <div className="mhn-invite-grow-card">
      <div className="mhn-invite-grow-content">
        <h4 className="mhn-invite-grow-title">Invite & Grow</h4>
        <p className="mhn-invite-grow-desc">
          Invite players, coaches, and families to grow your hockey network.
        </p>
        <Button onClick={onInviteClick} className="mhn-btn-invite-now">
          Invite Now
        </Button>
      </div>

      <div className="mhn-invite-grow-illustration">
        <Image
          src='/InviteGrow.png'
          alt="Invite and Grow Illustration"
          fill
          className="mhn-invite-illustration-img"
        />
      </div>
    </div>
  );
};
