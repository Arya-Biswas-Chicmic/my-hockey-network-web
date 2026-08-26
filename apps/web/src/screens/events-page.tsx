import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import Image from 'next/image';
import React, { useState } from 'react';
import { Header } from '@/components/common/Header';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { useDebounce } from '@/hooks/use-debounce';
import { EventCard, EventCardProps } from '@/components/features/events/EventCard';
import { CalendarView } from '@/components/features/events/CalendarView';
import { CalendarDays, ChevronDown, List, Search } from 'lucide-react';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const EventsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeNavTab, setActiveNavTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 800);
  const [activeFilterPill, setActiveFilterPill] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  // Sample events matching the Figma design screenshot
  const eventsList: EventCardProps[] = [
    {
      id: 'e1',
      title: '2026 Tim Hortons NHL Heritage Classic',
      image: '/event1.png',
      date: 'October 25, 2026',
      location: 'Princess Auto Stadium – Winnipeg,...'
    },
    {
      id: 'e2',
      title: 'Power Skating Clinic',
      image: '/event2.png',
      date: 'Sun, may 25 • 2:00 PM',
      location: 'Austria ,Europe'
    },
    {
      id: 'e3',
      title: 'Power Skating Clinic',
      image: '/event3.png',
      date: 'Sun, may 25 • 2:00 PM',
      location: 'Austria ,Europe'
    },
    {
      id: 'e4',
      title: 'Power Skating Clinic',
      image: '/event4.png',
      date: 'Sun, may 25 • 2:00 PM',
      location: 'Austria ,Europe'
    },
    {
      id: 'e5',
      title: 'Power Skating Clinic',
      image: '/event5.png',
      date: 'Sun, may 25 • 2:00 PM',
      location: 'Austria European'
    },
    {
      id: 'e6',
      title: 'Power Skating Clinic',
      image: '/event6.png',
      date: 'Sun, may 25 • 2:00 PM',
      location: 'Austria ,Europe'
    }
  ];

  const filterPills = [
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'weekend', label: 'This Weekend' },
    { id: 'under10km', label: 'Under 10 km' },
    { id: 'workshops', label: 'Workshops' }
  ];

  return (
    <div className="mhn-events-page-root">
      {/* Top Navigation Bar Header */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
      />

      {/* Pending Guardian Notice Banner */}
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

      {/* Main Content Area */}
      <main className="mhn-events-main-container">
        {/* Page Top Header Bar */}
        <div className="mhn-events-top-bar">
          <div className="mhn-events-header-text">
            <h2 className="mhn-events-page-title">Events</h2>
            <p className="mhn-events-page-subtitle">
              Discover tournaments, camps, meet ups, and hockey networking events
            </p>
          </div>

          <div className="mhn-events-header-actions">
            {/* Search Input Box */}
            <div className="mhn-events-search-wrapper">
              <Search className="mhn-events-search-icon" size={16} aria-hidden="true" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="mhn-events-search-input"
              />
            </div>
          </div>
        </div>

        {/* View Switcher & Filters Row */}
        <div className="mhn-events-controls-row">
          {/* View Mode Switcher Toggle: List vs Calendar */}
          <div className="mhn-view-switcher-pill">
            <Button
              onClick={() => setViewMode('list')}
              className={`mhn-view-pill-btn ${viewMode === 'list' ? 'mhn-view-pill-btn-active' : ''}`}
              title="List View"
              aria-label="List View"
            >
              <List size={18} color={viewMode === 'list' ? '#1860C3' : '#64748B'} aria-hidden="true" />
            </Button>
            <div className="mhn-view-pill-divider" />
            <Button
              onClick={() => setViewMode('calendar')}
              className={`mhn-view-pill-btn ${viewMode === 'calendar' ? 'mhn-view-pill-btn-active' : ''}`}
              title="Calendar View"
              aria-label="Calendar View"
            >
              <CalendarDays size={18} color={viewMode === 'calendar' ? '#1860C3' : '#64748B'} aria-hidden="true" />
            </Button>
          </div>

          {/* Filter Pills Row */}
          <div className="mhn-events-filter-pills-row">
            {/* Main Filter Dropdown Button */}
            <Button className="mhn-filter-btn-main">
              <Image src="/filters.png" alt="Filters" width={16} height={16} className="mhn-filter-icon-img" />
              <span>Filters</span>
              <ChevronDown size={12} aria-hidden="true" />
            </Button>

            {/* Quick Filter Pill Buttons */}
            {filterPills.map((pill) => (
              <Button
                key={pill.id}
                onClick={() => setActiveFilterPill(activeFilterPill === pill.id ? null : pill.id)}
                className={`mhn-filter-pill ${activeFilterPill === pill.id ? 'mhn-filter-pill-active' : ''}`}
              >
                {pill.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Dynamic View: List vs Calendar */}
        {viewMode === 'list' ? (
          <div className="mhn-events-cards-grid">
            {eventsList
              .filter((event) =>
                !debouncedSearchQuery.trim() ||
                event.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
              )
              .map((event) => (
                <EventCard 
                  key={event.id} 
                  {...event} 
                  onCardClick={() => onNavigate && onNavigate('event-detail')}
                />
              ))}
          </div>
        ) : (
          <CalendarView
            onEventClick={() => onNavigate && onNavigate('event-detail')}
          />
        )}
      </main>
    </div>
  );
};
