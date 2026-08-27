import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/common/Button';

interface InviteGrowWidgetProps {
  onInviteClick?: () => void;
  illustrationUrl?: string;
}

export const InviteGrowWidget: React.FC<InviteGrowWidgetProps> = ({
  onInviteClick,
  illustrationUrl = '/player.png',
}) => {
  return (
    <div className="mhn-invite-grow-card relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="mhn-invite-grow-content flex flex-col justify-between pr-24 z-10 relative min-h-[110px]">
        <div>
          <h4 className="mhn-invite-grow-title text-sm font-bold text-slate-100 mb-1">Invite & Grow</h4>
          <p className="mhn-invite-grow-desc text-xs text-slate-400 leading-relaxed max-w-[180px]">
            Invite players, coaches, and families to grow your hockey network.
          </p>
        </div>

        <Button
          onClick={onInviteClick}
          className="mhn-btn-invite-now mt-3 self-start rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-blue-500 active:scale-95"
        >
          Invite Now
        </Button>
      </div>

      <div className="mhn-invite-grow-illustration absolute -right-2 -bottom-2 h-32 w-28 opacity-90 pointer-events-none z-0">
        <Image
          src={illustrationUrl}
          alt="Invite and Grow Mascot"
          fill
          className="mhn-invite-illustration-img object-contain object-bottom-right"
        />
      </div>
    </div>
  );
};
