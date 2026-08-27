import { CalendarX2 } from 'lucide-react';

import { NoDataFound } from '@/components/common/no-data-found';

interface CalendarViewProps {
  onEventClick?: (eventId: string) => void;
}

/** Honest empty state until the product has an events API and calendar data. */
export function CalendarView(_props: Readonly<CalendarViewProps>) {
  return (
    <div className="mhn-calendar-view-container">
      <NoDataFound
        title="No calendar events"
        description="Events will appear on the calendar after the events service is connected."
        icon={<CalendarX2 size={32} strokeWidth={1.75} aria-hidden="true" />}
      />
    </div>
  );
}
