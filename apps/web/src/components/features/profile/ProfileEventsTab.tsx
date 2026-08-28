'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input, Select } from '@/components/common/FormControls';
import { EventCard } from '@/components/features/events/EventCard';
import { profileDemoData } from '@/demo-data/profile';

export function ProfileEventsTab() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Interested');
  const [interestedIds, setInterestedIds] = useState(() => new Set(profileDemoData.events.map((event) => event.id)));
  const events = useMemo(() => profileDemoData.events.filter((event) => event.title.toLowerCase().includes(query.trim().toLowerCase())), [query]);
  const toggleInterested = (id: string) => setInterestedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <section className="rounded-lg border border-auth-stroke bg-auth-field p-4 text-foreground">
      <h2 className="text-lg font-bold">Events</h2>
      <div className="mt-4 grid grid-cols-[1fr_132px] gap-2 max-[520px]:grid-cols-1">
        <div className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={query} onValueChange={setQuery} disableAutoSanitize placeholder="Search events" className="h-9 w-full rounded-lg border border-auth-stroke bg-background pl-9 pr-3 text-xs text-foreground" /></div>
        <Select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-9 rounded-lg border border-auth-stroke bg-background px-3 text-xs text-foreground" aria-label="Event relationship"><option>Interested</option><option>Going</option><option>Hosted</option></Select>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {events.map((event) => <EventCard key={event.id} {...event} compact isInterested={interestedIds.has(event.id)} onToggleInterested={toggleInterested} />)}
      </div>
    </section>
  );
}
