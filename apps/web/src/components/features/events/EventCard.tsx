import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { FallbackImage } from '@/components/ui/fallback-image';

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
        <FallbackImage
          src={image}
          alt={title}
          fill
          fallbackSrc="/empowering.png"
          className="mhn-event-card-img"
        />
      </div>

      {/* Event Card Content */}
      <div className="mhn-event-card-body">
        <h3 className="mhn-event-card-title">{title}</h3>

        <div className="mhn-event-card-info-stack">
          {/* Date Info */}
          <div className="mhn-event-card-info-line">
            <Clock size={14} aria-hidden="true" />
            <span className='date-1'>{date}</span>
          </div>

          {/* Location Info */}
          <div className="mhn-event-card-info-line">
            <MapPin size={14} aria-hidden="true" />
            <span className="mhn-event-location-text">{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
