import { Button } from '../../common/Button';
import React from 'react';

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
            className="mhn-event-card-item"
            onClick={() => onEventClick && onEventClick(event.id)}
            style={{ cursor: 'pointer' }}
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{event.time}</span>
              </div>

              <div className="mhn-event-info-line">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
