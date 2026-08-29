'use client';

import { useState, type ComponentType } from 'react';
import { Armchair, Ban, CalendarDays, ChevronDown, ChevronRight, CircleParking, Droplets, MapPin, MoreHorizontal, Share2, Smile, Toilet, Users } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { EventOrganizerDialog } from '@/components/features/events/EventOrganizerDialog';
import { PageShell } from '@/components/layout/PageShell';
import { FallbackImage } from '@/components/ui/fallback-image';
import { demoEventDetail, type EventThingIcon } from '@/demo-data/events';
import { cn } from '@/utils/cn';
import { showInfoToast, showSuccessToast } from '@/utils/toast';

interface EventDetailPageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
  eventTitle?: string;
  bannerImage?: string;
  onBack?: () => void;
}

type DetailIcon = ComponentType<{ className?: string; size?: number }>;

const thingIcons: Record<EventThingIcon, DetailIcon> = {
  guardian: Users,
  seating: Armchair,
  'kid-friendly': Smile,
  pets: Ban,
  water: Droplets,
  washrooms: Toilet,
  parking: CircleParking,
};

export function EventDetailPage({ onNavigate, eventTitle = demoEventDetail.title, bannerImage = demoEventDetail.bannerImage, onBack }: Readonly<EventDetailPageProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [isPeopleOpen, setIsPeopleOpen] = useState(false);
  const handleBack = () => (onBack ? onBack() : onNavigate?.('events'));

  return (
    <PageShell maxWidth={1166} className="lg:my-0 lg:min-h-0 lg:flex-1">
      {/* This page's own content is taller than the viewport once "About"/
          "Things to know" render, but `.mhn-app-content` clips overflow at
          `lg:` (see its `lg:h-dvh lg:overflow-hidden` in `AppShell.tsx`) —
          without an internal scroll owner here, everything past one
          viewport height was simply clipped and unreachable (bug report
          2026-08-31: "event page details scrolling is not working").
          `lg:h-full lg:overflow-y-auto` on this inner section, plus
          `lg:min-h-0 lg:flex-1` on the `PageShell` above so it actually
          shrinks to the available height instead of overflowing it, is the
          same pattern Profile's own scroll section already uses. */}
      <section className="mhn-layout-col-center flex flex-col gap-6 pb-16 text-foreground lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
        <header className="flex items-center gap-3">
          <Button type="button" variant="unstyled" className="flex size-8 items-center justify-center rounded-full hover:bg-muted" onClick={handleBack} aria-label="Back to events">
            <ChevronRight size={24} className="rotate-180" aria-hidden="true" />
          </Button>
          <h1 className="min-w-0 flex-1 truncate text-2xl font-bold leading-8">{eventTitle}</h1>
          <Button type="button" variant="unstyled" className="flex size-9 items-center justify-center rounded-full hover:bg-muted" aria-label="Event options">
            <MoreHorizontal size={24} aria-hidden="true" />
          </Button>
        </header>

        <div className="relative aspect-[1166/453] min-h-[220px] w-full overflow-hidden rounded-2xl bg-muted">
          <FallbackImage src={bannerImage} alt={eventTitle} fill priority sizes="(max-width: 1200px) 100vw, 1166px" className="object-cover" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0 space-y-8">
            <div className="grid grid-cols-3 gap-3" aria-label="Event actions">
              <Button
                type="button"
                className={cn('h-11 rounded-lg text-sm font-semibold', isRegistered ? 'border border-primary bg-transparent text-primary' : 'bg-primary text-primary-foreground')}
                onClick={() => {
                  setIsRegistered((value) => !value);
                  showSuccessToast(isRegistered ? 'Registration cancelled.' : 'Registration confirmed.');
                }}
              >
                {isRegistered ? 'Registered' : 'Register'}
              </Button>
              <Button type="button" variant="solid-outline" className={cn('h-11 py-0 text-sm font-semibold', isInterested && 'border-primary text-primary')} onClick={() => setIsInterested((value) => !value)}>
                Interested
              </Button>
              <Button type="button" variant="solid-outline" className="h-11 py-0 text-sm font-semibold" onClick={() => showInfoToast('Event link copied to clipboard.')}>
                <Share2 size={16} aria-hidden="true" /> Share
              </Button>
            </div>

            <div>
              <h2 className="mb-2 text-[21px] font-bold leading-8">About</h2>
              <p className={cn('text-lg leading-[27px] text-muted-foreground', !isExpanded && 'line-clamp-4')}>{demoEventDetail.description}</p>
              <Button type="button" variant="unstyled" className="mt-2 gap-1 text-sm font-semibold text-foreground" onClick={() => setIsExpanded((value) => !value)}>
                {isExpanded ? 'Show less' : 'Read more'}
                <ChevronDown size={14} className={cn('transition-transform', isExpanded && 'rotate-180')} aria-hidden="true" />
              </Button>
            </div>

            <div>
              <h2 className="mb-4 text-[21px] font-bold leading-8">Things to know</h2>
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {demoEventDetail.thingsToKnow.map((thing) => {
                  const Icon = thingIcons[thing.icon];
                  return (
                    <div key={thing.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon size={20} className="shrink-0 text-foreground" aria-hidden="true" />
                      <span>{thing.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <EventMetaRow icon={MapPin} title={demoEventDetail.location.title} subtitle={demoEventDetail.location.subtitle} />
              <EventMetaRow icon={CalendarDays} title={demoEventDetail.schedule.title} subtitle={demoEventDetail.schedule.subtitle} bordered />
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-4 text-base font-semibold">Guests</h2>
              <div className="flex items-center gap-10">
                <div><p className="text-xl font-bold">{demoEventDetail.guests.going}</p><p className="text-sm text-muted-foreground">Going</p></div>
                <div><p className="text-xl font-bold">{demoEventDetail.guests.interested}</p><p className="text-sm text-muted-foreground">Interested</p></div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Event Organiser &amp; Attendant</h2>
                <Button type="button" variant="unstyled" className="shrink-0 text-xs font-semibold text-primary" onClick={() => setIsPeopleOpen(true)}>View All</Button>
              </div>
              <div className="space-y-4">
                {demoEventDetail.people.slice(0, 4).map((person) => (
                  <div key={person.id} className="flex items-center gap-2">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
                      <FallbackImage src={person.avatar} alt={person.name} fill sizes="40px" className="object-cover" />
                    </div>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold">{person.name}</p><p className="text-xs text-muted-foreground">{person.role}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <EventOrganizerDialog open={isPeopleOpen} onOpenChange={setIsPeopleOpen} people={demoEventDetail.people} />
    </PageShell>
  );
}

interface EventMetaRowProps {
  icon: DetailIcon;
  title: string;
  subtitle: string;
  bordered?: boolean;
}

function EventMetaRow({ icon: Icon, title, subtitle, bordered = false }: Readonly<EventMetaRowProps>) {
  return (
    <div className={cn('flex items-center gap-3 p-4', bordered && 'border-t border-border')}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground"><Icon size={20} aria-hidden="true" /></span>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{title}</p><p className="text-xs text-muted-foreground">{subtitle}</p></div>
      <ChevronRight size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}
