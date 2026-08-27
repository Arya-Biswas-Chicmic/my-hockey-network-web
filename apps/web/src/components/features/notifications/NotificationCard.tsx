import React from 'react';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';

export interface NotificationItemProps {
  id: string;
  avatar: string;
  senderName: string;
  text: string;
  time: string;
  isUnread?: boolean;
  isRequest?: boolean;
  requestStatus?: 'pending' | 'accepted' | 'rejected';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onItemClick?: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationItemProps> = ({
  id,
  avatar,
  senderName,
  text,
  time,
  isUnread = false,
  isRequest = false,
  requestStatus = 'pending',
  onAccept,
  onReject,
  onItemClick,
}) => {
  return (
    <div
      onClick={() => onItemClick && onItemClick(id)}
      className="flex items-center justify-between gap-4 py-3.5 border-b border-[#162238]/60 last:border-none transition-colors"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* User Avatar */}
        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-slate-900 border border-[#1E2D4A]">
          <FallbackImage
            src={avatar}
            alt={senderName}
            fill
            fallbackSrc="/userPlaceholder.png"
            className="object-cover"
          />
        </div>

        {/* Notification Text Content */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <p className="text-sm text-slate-200 leading-snug">
            <span className="font-bold text-slate-100">{senderName}</span>{' '}
            <span>{text}</span>
          </p>
          <span className="text-xs text-slate-400 font-medium">{time}</span>
        </div>
      </div>

      {/* Right Side Actions or Unread Dot */}
      <div className="flex items-center gap-3 shrink-0">
        {isRequest ? (
          requestStatus === 'pending' ? (
            <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                onClick={() => onReject?.(id)}
                className="w-24 h-9 rounded-xl text-xs font-semibold bg-transparent text-[#168BFF] border border-[#168BFF] hover:bg-[#168BFF]/10 transition-all flex items-center justify-center"
              >
                Reject
              </Button>
              <Button
                type="button"
                onClick={() => onAccept?.(id)}
                className="w-24 h-9 rounded-xl text-xs font-semibold bg-[#168BFF] text-white hover:bg-[#147CE6] transition-all flex items-center justify-center shadow-md shadow-[#168BFF]/20"
              >
                Accept
              </Button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-[#168BFF] px-3 py-1 bg-[#152744] rounded-full border border-[#168BFF]/30">
              {requestStatus === 'accepted' ? 'Accepted' : 'Rejected'}
            </span>
          )
        ) : isUnread ? (
          <div className="w-2.5 h-2.5 rounded-full bg-[#168BFF] shrink-0" aria-label="Unread notification" />
        ) : null}
      </div>
    </div>
  );
};

