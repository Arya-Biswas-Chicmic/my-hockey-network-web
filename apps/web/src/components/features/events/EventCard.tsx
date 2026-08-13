import React from 'react';

export interface EventCardProps {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  onCardClick?: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  image,
  date,
  location,
  onCardClick
}) => {
  return (
    <div 
      className="mhn-event-grid-card"
      onClick={() => onCardClick && onCardClick(id)}
    >
      {/* Event Image Banner */}
      <div className="mhn-event-card-banner-box">
        <img 
          src={image} 
          alt={title} 
          className="mhn-event-card-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/empowering.png';
          }}
        />
      </div>

      {/* Event Card Content */}
      <div className="mhn-event-card-body">
        <h3 className="mhn-event-card-title">{title}</h3>

        <div className="mhn-event-card-info-stack">
          {/* Date Info */}
          <div className="mhn-event-card-info-line">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className='date-1'>{date}</span>
          </div>

          {/* Location Info */}
          <div className="mhn-event-card-info-line">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="mhn-event-location-text">{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
