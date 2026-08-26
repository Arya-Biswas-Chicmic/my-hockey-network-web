import { Button } from '@/components/common/Button';
import React from 'react';
import { Clock, MapPin } from 'lucide-react';

export interface EventItem {
  id: string;
  month: string;
  day: string;
  title: string;
  time: string;
  location: string;
}

interface UpcomingEventsWidgetProps {
  events?: EventItem[];
  onViewAll?: () => void;
  onEventClick?: (id: string) => void;
}

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'e1',
    month: 'MAY',
    day: '27',
    title: 'Team Practice',
    time: '5:00 PM - 7:00 PM',
    location: 'Toronto'
  }
];

export const UpcomingEventsWidget: React.FC<UpcomingEventsWidgetProps> = ({
  events = DEFAULT_EVENTS,
  onViewAll,
  onEventClick
}) => {
  return (
    <div className="mhn-sidebar-card">
      <div className="mhn-sidebar-card-header">
        <h3 className="mhn-sidebar-card-title">Upcoming Events</h3>
        <Button onClick={onViewAll} className="mhn-sidebar-view-all">
          View All
        </Button>
      </div>

      <div className="mhn-events-list">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="mhn-event-card-item mhn-cursor-pointer"
            onClick={() => onEventClick && onEventClick(event.id)}
          >
            {/* Left Date Badge Box */}
            <div className="mhn-event-date-box">
              <span className="mhn-event-month">{event.month}</span>
              <span className="mhn-event-day">{event.day}</span>
            </div>

            {/* Right Event Meta */}
            <div className="mhn-event-details">
              <h4 className="mhn-event-title">{event.title}</h4>
              
              <div className="mhn-event-info-line">
                <Clock size={14} aria-hidden="true" />
                <span>{event.time}</span>
              </div>

              <div className="mhn-event-info-line">
                <MapPin size={14} aria-hidden="true" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
