import React from 'react';
import { Clock, MapPin, MoreHorizontal, Star, Users } from 'lucide-react';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

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
  compact?: boolean;
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
  compact = false,
}) => {
  return (
    <article className={cn(
      'mhn-event-card overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors hover:border-border-strong',
      compact ? 'grid grid-cols-[132px_1fr] max-[440px]:grid-cols-1' : 'flex flex-col',
    )}>
      {/* Event Cover Box */}
      <div
        className={cn('relative cursor-pointer overflow-hidden bg-secondary', compact ? 'h-full min-h-[132px]' : 'aspect-[16/9] w-full')}
        onClick={() => onCardClick?.(id)}
      >
        <FallbackImage
          src={image}
          alt={title}
          fill
          sizes={compact ? '(max-width: 440px) 100vw, 132px' : '(max-width: 768px) 100vw, 470px'}
          fallbackSrc="/classic.webp"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Top-Right Menu Options Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-md transition-colors hover:bg-background/90"
          aria-label="Event Options"
        >
          <MoreHorizontal size={16} />
        </Button>
      </div>

      {/* Event Card Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3
          className="line-clamp-2 cursor-pointer text-sm font-bold text-foreground transition-colors hover:text-primary"
          onClick={() => onCardClick?.(id)}
        >
          {title}
        </h3>

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          {/* Date Info */}
          <div className="flex items-center gap-2">
            <Clock size={14} className="shrink-0" />
            <span className="truncate">{date}</span>
          </div>

          {/* Location Info */}
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          {/* Attendees Stats Line */}
          <div className="flex items-center gap-2">
            <Users size={14} className="shrink-0" />
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
            className={`flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all ${
              isInterested
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-border bg-secondary text-secondary-foreground hover:bg-accent'
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
