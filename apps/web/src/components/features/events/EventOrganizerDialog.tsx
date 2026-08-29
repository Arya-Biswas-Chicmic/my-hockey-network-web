'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { SearchWidget } from '@/components/features/home/SearchWidget';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { DemoEventPerson } from '@/demo-data/events';

interface EventOrganizerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: readonly DemoEventPerson[];
}

export function EventOrganizerDialog({ open, onOpenChange, people }: Readonly<EventOrganizerDialogProps>) {
  const [query, setQuery] = useState('');
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const filteredPeople = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return people;
    return people.filter((person) => `${person.name} ${person.role}`.toLowerCase().includes(normalizedQuery));
  }, [people, query]);

  const toggleFollow = (personId: string) => {
    setFollowingIds((current) => {
      const next = new Set(current);
      if (next.has(personId)) next.delete(personId);
      else next.add(personId);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[527px] overflow-hidden rounded-lg border border-border bg-card shadow-2xl" showCloseButton>
        <DialogHeader className="min-h-16 items-center justify-center border-b border-border px-16 py-5">
          <DialogTitle className="text-center text-xl font-semibold text-foreground">Event Organiser &amp; Attendant</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex max-h-[447px] flex-col gap-5 p-4">
          <SearchWidget value={query} onChange={setQuery} placeholder="Search organiser or attendant" className="w-full" />
          <div className="flex flex-col gap-5" aria-live="polite">
            {filteredPeople.map((person) => {
              const isFollowing = followingIds.has(person.id);
              return (
                <div key={person.id} className="flex items-center gap-2">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
                    <FallbackImage src={person.avatar} alt={person.name} fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{person.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{person.role}</p>
                  </div>
                  <Button type="button" variant="solid-outline" className="h-7 min-w-[67px] border-primary px-3 py-0 text-xs font-semibold text-primary hover:bg-accent" onClick={() => toggleFollow(person.id)}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              );
            })}
            {filteredPeople.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No people found.</p> : null}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
