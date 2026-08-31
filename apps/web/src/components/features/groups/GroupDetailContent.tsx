'use client';

import { useMemo, useState } from 'react';
import { Download, FileText, LockKeyhole, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { EventCard } from '@/components/features/events/EventCard';
import { FeedPostCard } from '@/components/features/home/FeedPostCard';
import { SearchWidget } from '@/components/features/home/SearchWidget';
import { FallbackImage } from '@/components/ui/fallback-image';
import type { DemoGroupDetail, GroupDetailTab } from '@/demo-data/groups';

interface GroupDetailContentProps {
  group: DemoGroupDetail;
  activeTab: GroupDetailTab;
  onEventClick?: (eventId: string) => void;
}

export function GroupDetailContent({ group, activeTab, onEventClick }: Readonly<GroupDetailContentProps>) {
  if (activeTab === 'posts') {
    return <div className="space-y-4">{group.posts.map((post) => <FeedPostCard key={post.id} {...post} demoMode />)}</div>;
  }
  if (activeTab === 'about') return <AboutTab group={group} />;
  if (activeTab === 'people') return <PeopleTab group={group} />;
  if (activeTab === 'events') return <EventsTab group={group} onEventClick={onEventClick} />;
  if (activeTab === 'media') return <MediaTab group={group} />;
  return <FilesTab group={group} />;
}

function Panel({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-lg font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function AboutTab({ group }: Readonly<{ group: DemoGroupDetail }>) {
  return (
    <Panel title={`About ${group.name}`}>
      <p className="text-sm leading-6 text-muted-foreground">{group.about.description}</p>
      <div className="mt-6 space-y-5 border-t border-border pt-5">
        <AboutRow icon={LockKeyhole} title={group.about.privacy} description={group.about.visibility} />
        <AboutRow icon={Users} title={group.about.created} />
        <AboutRow icon={MapPin} title={group.about.location} />
      </div>
    </Panel>
  );
}

function AboutRow({ icon: Icon, title, description }: Readonly<{ icon: typeof Users; title: string; description?: string }>) {
  return (
    <div className="flex gap-3">
      <Icon size={20} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div><p className="text-sm font-semibold text-foreground">{title}</p>{description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p> : null}</div>
    </div>
  );
}

function PeopleTab({ group }: Readonly<{ group: DemoGroupDetail }>) {
  const [query, setQuery] = useState('');
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const people = useMemo(() => group.people.filter((person) => `${person.name} ${person.role}`.toLowerCase().includes(query.trim().toLowerCase())), [group.people, query]);
  return (
    <Panel title="People">
      <SearchWidget value={query} onChange={setQuery} placeholder="Search members" className="mb-5 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        {people.map((person) => (
          <div key={person.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted"><FallbackImage src={person.avatar} alt={person.name} fill sizes="44px" className="object-cover" /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{person.name}</p><p className="text-xs text-muted-foreground">{person.role}</p></div>
            <Button type="button" variant="solid-outline" className="h-8 border-primary px-3 py-0 text-xs text-primary" onClick={() => setFollowing((current) => { const next = new Set(current); if (next.has(person.id)) next.delete(person.id); else next.add(person.id); return next; })}>{following.has(person.id) ? 'Following' : 'Follow'}</Button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function EventsTab({ group, onEventClick }: Readonly<{ group: DemoGroupDetail; onEventClick?: (eventId: string) => void }>) {
  const [query, setQuery] = useState('');
  const [interestedIds, setInterestedIds] = useState(() => new Set(group.events.filter((event) => event.isInterested).map((event) => event.id)));
  const events = group.events.filter((event) => `${event.title} ${event.location}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <section>
      {/* No standalone "Events" heading — the tab bar right above already
          says Events (feedback 2026-08-31: "Remove this event text and
          expand search bar"). The search bar takes the freed row. */}
      <SearchWidget value={query} onChange={setQuery} className="mb-4 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((event) => <EventCard key={event.id} {...event} isInterested={interestedIds.has(event.id)} onCardClick={onEventClick} onToggleInterested={(id) => setInterestedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })} />)}
      </div>
    </section>
  );
}

function MediaTab({ group }: Readonly<{ group: DemoGroupDetail }>) {
  return (
    <Panel title="Media">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {group.media.map((item) => <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted"><FallbackImage src={item.src} alt={item.alt} fill sizes="(max-width: 640px) 50vw, 220px" className="object-cover transition-transform duration-300 hover:scale-105" /></div>)}
      </div>
    </Panel>
  );
}

function FilesTab({ group }: Readonly<{ group: DemoGroupDetail }>) {
  return (
    <Panel title="Files">
      <div className="space-y-3">
        {group.files.map((file) => (
          <div key={file.id} className="flex items-center gap-3 rounded-lg border border-border p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary"><FileText size={20} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{file.name}</p><p className="text-xs text-muted-foreground">{file.type} · {file.size} · {file.updated}</p></div>
            <Button type="button" variant="unstyled" className="flex size-9 items-center justify-center rounded-lg hover:bg-muted" aria-label={`Download ${file.name}`}><Download size={18} aria-hidden="true" /></Button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
