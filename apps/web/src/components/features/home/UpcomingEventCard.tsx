import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { UpcomingEvent } from '@/types/home.types';

export interface UpcomingEventCardProps {
  event: UpcomingEvent;
  onClick?: (id: string) => void;
}

export const UpcomingEventCard: React.FC<UpcomingEventCardProps> = ({ event, onClick }) => {
  return (
    <div
      className="mhn-event-card-item mhn-cursor-pointer flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 transition-colors hover:border-slate-700 hover:bg-slate-800/60"
      onClick={() => onClick?.(event.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(event.id)}
    >
      {/* Left Date Badge Box */}
      <div className="mhn-event-date-box flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">
        <span className="mhn-event-month text-[10px] uppercase tracking-wider text-blue-200 font-semibold">
          {event.month}
        </span>
        <span className="mhn-event-day text-lg leading-none font-extrabold">{event.day}</span>
      </div>

      {/* Right Event Meta */}
      <div className="mhn-event-details min-w-0 flex-1">
        <h4 className="mhn-event-title truncate text-sm font-semibold text-slate-100">{event.title}</h4>

        <div className="mhn-event-info-line mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">{event.time}</span>
        </div>

        <div className="mhn-event-info-line mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>
    </div>
  );
};
