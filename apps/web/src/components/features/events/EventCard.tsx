import React from 'react';
import { Clock, MapPin, MoreHorizontal, Star, Users } from 'lucide-react';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';

export interface EventCardProps {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  interestedCount?: string;
  goingCount?: string;
  isInterested?: boolean;
  onToggleInterested?: (id: string) => void;
  onCardClick?: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  image,
  date,
  location,
  interestedCount = '1.5k',
  goingCount = '37',
  isInterested = true,
  onToggleInterested,
  onCardClick,
}) => {
  return (
    <article className="mhn-event-card bg-[#0A1220] border border-[#162238] rounded-2xl overflow-hidden flex flex-col shadow-lg transition-all hover:border-[#1F3352]">
      {/* Event Cover Box */}
      <div
        className="relative w-full aspect-[16/9] bg-slate-900 cursor-pointer overflow-hidden"
        onClick={() => onCardClick?.(id)}
      >
        <FallbackImage
          src={image}
          alt={title}
          fill
          fallbackSrc="/classic.png"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Top-Right Menu Options Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-slate-200 flex items-center justify-center hover:bg-black/70 transition-colors"
          aria-label="Event Options"
        >
          <MoreHorizontal size={16} />
        </Button>
      </div>

      {/* Event Card Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3
          className="text-sm font-bold text-slate-100 cursor-pointer hover:text-[#168BFF] transition-colors line-clamp-2"
          onClick={() => onCardClick?.(id)}
        >
          {title}
        </h3>

        <div className="flex flex-col gap-1.5 text-xs text-slate-400">
          {/* Date Info */}
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{date}</span>
          </div>

          {/* Location Info */}
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          {/* Attendees Stats Line */}
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">
              {interestedCount} Interested · {goingCount} Going
            </span>
          </div>
        </div>

        {/* Interested Action Button */}
        <div className="mt-auto pt-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onToggleInterested?.(id);
            }}
            className={`w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              isInterested
                ? 'bg-[#168BFF] text-white hover:bg-[#147CE6] shadow-md shadow-[#168BFF]/20'
                : 'bg-[#15243B] text-slate-300 border border-[#1F3352] hover:bg-[#1C304F]'
            }`}
          >
            <Star size={14} fill={isInterested ? 'currentColor' : 'none'} />
            <span>Interested</span>
          </Button>
        </div>
      </div>
    </article>
  );
};

