import { useState, useEffect } from 'react';
import { UpcomingEvent } from '@/types/home.types';
import { HomeService } from '@/services/home.service';

export function useUpcomingEvents(initialEvents?: UpcomingEvent[]) {
  const [events, setEvents] = useState<UpcomingEvent[]>(initialEvents || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialEvents);

  useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setEvents(initialEvents);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    HomeService.getUpcomingEvents()
      .then((data) => {
        if (isMounted) {
          setEvents(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Error fetching upcoming events:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialEvents]);

  return {
    events,
    isLoading,
  };
}
