import React from 'react';
import { Button } from '@/components/common/Button';
import { UpcomingEvent } from '@/types/home.types';
import { useUpcomingEvents } from '@/hooks/useUpcomingEvents';
import { UpcomingEventCard } from '@/components/features/home/UpcomingEventCard';

export interface UpcomingEventsWidgetProps {
  events?: UpcomingEvent[];
  onViewAll?: () => void;
  onEventClick?: (id: string) => void;
}

export const UpcomingEventsWidget: React.FC<UpcomingEventsWidgetProps> = ({
  events: initialEvents,
  onViewAll,
  onEventClick,
}) => {
  const { events, isLoading } = useUpcomingEvents(initialEvents);

  return (
    <div className="mhn-sidebar-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm mb-4">
      <div className="mhn-sidebar-card-header flex items-center justify-between mb-3">
        <h3 className="mhn-sidebar-card-title text-sm font-bold text-slate-100">Upcoming Events</h3>
        {onViewAll && (
          <Button
            onClick={onViewAll}
            className="mhn-sidebar-view-all text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All
          </Button>
        )}
      </div>

      <div className="mhn-events-list flex flex-col gap-3">
        {isLoading ? (
          <div className="mhn-event-card-item flex items-center gap-4 rounded-xl border border-slate-800/80 p-3 animate-pulse">
            <div className="h-14 w-14 rounded-lg bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-slate-800" />
              <div className="h-3 w-24 rounded bg-slate-800" />
            </div>
          </div>
        ) : (
          events.map((event) => (
            <UpcomingEventCard key={event.id} event={event} onClick={onEventClick} />
          ))
        )}
      </div>
    </div>
  );
};
