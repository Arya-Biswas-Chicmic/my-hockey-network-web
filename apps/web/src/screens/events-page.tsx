import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { EventCard } from '@/components/features/events/EventCard';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';

import { CategoryTabs, TabItem } from '@/components/features/home/HomeTabs';
import { PageShell } from '@/components/layout/PageShell';

const EVENTS_TOP_TABS: TabItem<'personal' | 'network' | 'explore'>[] = [
  { key: 'personal', label: 'Personal' },
  { key: 'network', label: 'Network' },
  { key: 'explore', label: 'Explore' },
];

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

interface EventItem {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  interestedCount: string;
  goingCount: string;
  isInterested: boolean;
  category: 'yours' | 'interested' | 'registered' | 'saved';
}

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'ev-1',
    title: '2026 Tim Hortons NHL Heritage Classic',
    image: '/classic.webp',
    date: 'October 29, 2026',
    location: 'Princess Auto Stadium · Winnipeg',
    interestedCount: '1.5k',
    goingCount: '37',
    isInterested: true,
    category: 'interested',
  },
  {
    id: 'ev-2',
    title: '2026 NHL Heritage Classic',
    image: '/event1.webp',
    date: 'October 29, 2026',
    location: 'Princess Auto Stadium · Winnipeg',
    interestedCount: '1.5k',
    goingCount: '37',
    isInterested: true,
    category: 'interested',
  },
  {
    id: 'ev-3',
    title: 'MHN Youth All-Stars Championship',
    image: '/event2.webp',
    date: 'November 15, 2026',
    location: 'Scotiabank Arena · Toronto',
    interestedCount: '2.1k',
    goingCount: '120',
    isInterested: false,
    category: 'yours',
  },
  {
    id: 'ev-4',
    title: 'Winter Classic Hockey Training Camp',
    image: '/playHockey.webp',
    date: 'December 04, 2026',
    location: 'Bell Centre · Montreal',
    interestedCount: '890',
    goingCount: '45',
    isInterested: false,
    category: 'registered',
  },
];

export const EventsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeTopTab, setActiveTopTab] = useState<'personal' | 'network' | 'explore'>('personal');
  const [activeFilterPill, setActiveFilterPill] = useState<string>('interested');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);

  const toggleInterested = (id: string) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, isInterested: !ev.isInterested } : ev))
    );
  };

  const filterPills = [
    { id: 'yours', label: 'Yours', count: 2 },
    { id: 'interested', label: 'Interested', count: 2 },
    { id: 'registered', label: 'Registered', count: 2 },
    { id: 'saved', label: 'Saved', count: 34 },
  ];

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      !searchQuery.trim() ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilterPill === 'interested') return matchesSearch && ev.isInterested;
    if (activeFilterPill === 'yours') return matchesSearch && ev.category === 'yours';
    if (activeFilterPill === 'registered') return matchesSearch && ev.category === 'registered';
    if (activeFilterPill === 'saved') return matchesSearch && ev.category === 'saved';

    return matchesSearch;
  });

  return (
    <>
      {!permissions.allowed && permissions.message && (
        <PendingBanner
          message={permissions.message}
          actionText={permissions.ctaText || 'Complete Profile'}
          onActionClick={() => {
            if (permissions.ctaAction === 'COMPLETE_PROFILE') {
              if (onNavigate) onNavigate('profile');
            } else if (permissions.ctaAction === 'GUARDIAN_APPROVAL') {
              if (onNavigate) onNavigate('supervision');
            } else if (permissions.ctaAction === 'LOGIN') {
              if (onNavigate) onNavigate('login');
            }
          }}
        />
      )}

      <PageShell className="mhn-events-main-container flex flex-col gap-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto pb-16">
        {/* Top Header Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-100">Events</h1>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input Box */}
            <div className="relative w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full h-10 pl-9 pr-3 bg-[#0D1627] border border-[#182740] rounded-xl text-xs text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#168BFF] transition-all"
              />
            </div>

            {/* Filters Button */}
            <Button className="h-10 px-3.5 bg-[#0D1627] border border-[#182740] rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 hover:bg-[#15243B] transition-colors">
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              <ChevronDown size={12} className="text-slate-400" />
            </Button>

            {/* View Mode Switcher */}
            <div className="h-10 bg-[#0D1627] border border-[#182740] rounded-xl p-1 flex items-center gap-1">
              <Button
                onClick={() => setViewMode('list')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  viewMode === 'list' ? 'bg-[#15243B] text-[#168BFF]' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List View"
              >
                <List size={16} />
              </Button>
              <Button
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  viewMode === 'grid' ? 'bg-[#15243B] text-[#168BFF]' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <Grid size={16} />
              </Button>
            </div>

            {/* + Create Event Button */}
            <Button className="h-10 px-4 bg-[#168BFF] hover:bg-[#147CE6] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-[#168BFF]/20 transition-all">
              <Plus size={16} />
              <span>Create Event</span>
            </Button>
          </div>
        </div>

        {/* Top-Level Tabs Bar (Personal, Network, Explore) */}
        <CategoryTabs
          tabs={EVENTS_TOP_TABS}
          activeTab={activeTopTab}
          onChange={setActiveTopTab}
          className="w-full"
        />

        {/* Sub-Category Filter Pills Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {filterPills.map((pill) => (
            <Button
              key={pill.id}
              onClick={() => setActiveFilterPill(pill.id)}
              className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeFilterPill === pill.id
                  ? 'bg-[#0A1A30] text-[#168BFF] border border-[#168BFF] shadow-sm'
                  : 'bg-[#09111E] text-slate-400 border border-[#162238] hover:text-slate-200 hover:bg-[#121E34]'
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`px-2 py-0.5 text-[11px] rounded-md font-bold ${
                  activeFilterPill === pill.id
                    ? 'bg-[#168BFF]/20 text-[#168BFF]'
                    : 'bg-[#152238] text-slate-400'
                }`}
              >
                {pill.count}
              </span>
            </Button>
          ))}
        </div>

        {/* Event Cards Grid */}
        <div
          className={`grid gap-6 mt-2 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          {filteredEvents.map((ev) => (
            <EventCard
              key={ev.id}
              id={ev.id}
              title={ev.title}
              image={ev.image}
              date={ev.date}
              location={ev.location}
              interestedCount={ev.interestedCount}
              goingCount={ev.goingCount}
              isInterested={ev.isInterested}
              onToggleInterested={toggleInterested}
              onCardClick={(id) => onNavigate && onNavigate('event-detail')}
            />
          ))}
        </div>
      </PageShell>
    </>
  );
};

