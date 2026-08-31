'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, MapPin, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { EventCard } from '@/components/features/events/EventCard';
import { FeedPostCard } from '@/components/features/home/FeedPostCard';
import { SearchWidget } from '@/components/features/home/SearchWidget';
import { FallbackImage } from '@/components/ui/fallback-image';
import type { DemoTeamDetail, TeamDetailTab } from '@/demo-data/teams';

interface TeamDetailContentProps {
  team: DemoTeamDetail;
  activeTab: TeamDetailTab;
  onEventClick?: (eventId: string) => void;
}

/** Content for each Team Detail tab. Mirrors `GroupDetailContent`'s
 * per-tab component split and its `FeedPostCard`/`EventCard`/`SearchWidget`
 * reuse — Posts and Events render through the exact same shared components
 * Home/Explore/Groups already use, so a team post or event looks identical
 * everywhere it appears. */
export function TeamDetailContent({ team, activeTab, onEventClick }: Readonly<TeamDetailContentProps>) {
  if (activeTab === 'posts') {
    return (
      <div className="space-y-2">
        {team.posts.map((post) => (
          <FeedPostCard key={post.id} {...post} demoMode />
        ))}
      </div>
    );
  }
  if (activeTab === 'members') return <MembersTab team={team} />;
  if (activeTab === 'events') return <EventsTab team={team} onEventClick={onEventClick} />;
  if (activeTab === 'media') return <MediaTab team={team} />;
  return <AboutTab team={team} />;
}

function Panel({ title, children }: Readonly<{ title?: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      {title ? <h2 className="mb-4 text-lg font-bold text-foreground">{title}</h2> : null}
      {children}
    </section>
  );
}

function MembersTab({ team }: Readonly<{ team: DemoTeamDetail }>) {
  const [query, setQuery] = useState('');
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const members = useMemo(
    () => team.members.filter((member) => member.name.toLowerCase().includes(query.trim().toLowerCase())),
    [team.members, query],
  );

  const toggleFollow = (id: string) => {
    setFollowingIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Panel>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">Members · {team.stats.members}</h2>
        <div className="flex items-center gap-2">
          <SearchWidget value={query} onChange={setQuery} className="w-56" />
          <Button type="button" variant="solid-outline" className="h-10 gap-2 px-3.5 py-0 text-xs font-semibold">
            <SlidersHorizontal size={14} aria-hidden="true" /> Filter
          </Button>
        </div>
      </div>

      <h3 className="mb-2 text-sm font-bold text-foreground">Roster</h3>
      <div className="divide-y divide-border">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 py-3.5">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
              <FallbackImage src={member.avatar} alt={member.name} fill sizes="44px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                #{member.jerseyNumber} • {member.position} at @{team.name}
              </p>
            </div>
            <Button
              type="button"
              variant="solid-outline"
              className="h-8 shrink-0 border-primary px-3 py-0 text-xs font-semibold text-primary"
              onClick={() => toggleFollow(member.id)}
            >
              {followingIds.has(member.id) ? 'Following' : 'Follow'}
            </Button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function EventsTab({ team, onEventClick }: Readonly<{ team: DemoTeamDetail; onEventClick?: (eventId: string) => void }>) {
  const [query, setQuery] = useState('');
  const [interestedIds, setInterestedIds] = useState(
    () => new Set(team.events.filter((event) => event.isInterested).map((event) => event.id)),
  );
  const events = team.events.filter((event) =>
    `${event.title} ${event.location}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section>
      {/* No standalone "Events" heading — the tab bar right above already
          says Events, so the label was pure redundancy inside the tab's
          own content (feedback 2026-08-31: "Remove this event text and
          expand search bar"). The search bar takes the freed row. */}
      <SearchWidget value={query} onChange={setQuery} className="mb-4 w-full" />
      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            {...event}
            compact
            isInterested={interestedIds.has(event.id)}
            onCardClick={onEventClick}
            onToggleInterested={(id) =>
              setInterestedIds((current) => {
                const next = new Set(current);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
            }
          />
        ))}
      </div>
    </section>
  );
}

function MediaTab({ team }: Readonly<{ team: DemoTeamDetail }>) {
  return (
    <Panel title="Media">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {team.media.map((item) => (
          <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <FallbackImage src={item.src} alt={item.alt} fill sizes="(max-width: 640px) 50vw, 220px" className="object-cover transition-transform duration-300 hover:scale-105" />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AboutTab({ team }: Readonly<{ team: DemoTeamDetail }>) {
  return (
    <Panel title="Description">
      <p className="text-sm leading-6 text-muted-foreground">{team.about.description}</p>

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="mb-3 text-sm font-bold text-foreground">Location</h3>
        <div className="flex items-center gap-4">
          <p className="flex-1 text-sm text-muted-foreground">{team.about.location}</p>
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
            <FallbackImage src={team.about.mapImage} alt={`Map of ${team.about.location}`} fill sizes="128px" className="object-cover" />
            <MapPin size={20} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary drop-shadow" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="mb-3 text-sm font-bold text-foreground">Leagues</h3>
        <div className="flex flex-col gap-3">
          {team.about.leagues.map((league) => (
            <div key={league.id} className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:border-border-strong">
              <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                <FallbackImage src={league.logo} alt={league.name} fill sizes="36px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{league.name}</p>
                <p className="text-xs text-muted-foreground">{league.subtitle}</p>
              </div>
              <ArrowUpRight size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
