import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { PendingBanner } from '../components/common/PendingBanner';
import { EventCard, EventCardProps } from '../components/features/events/EventCard';
import { CalendarView } from '../components/features/events/CalendarView';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const EventsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
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
        userName="Jack Ruffle"
        userAvatar="/jack.png"
      />

      {/* Pending Guardian Notice Banner */}
      <PendingBanner
        message="Guardian invitation pending. Your guardian has not yet accepted your request to connect."
        actionText="Manage Invitations"
        onActionClick={() => alert('Manage invitations clicked')}
      />

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
              <svg className="mhn-events-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
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
            <button
              onClick={() => setViewMode('list')}
              className={`mhn-view-pill-btn ${viewMode === 'list' ? 'mhn-view-pill-btn-active' : ''}`}
              title="List View"
              aria-label="List View"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'list' ? '#1860C3' : '#64748B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <div className="mhn-view-pill-divider" />
            <button
              onClick={() => setViewMode('calendar')}
              className={`mhn-view-pill-btn ${viewMode === 'calendar' ? 'mhn-view-pill-btn-active' : ''}`}
              title="Calendar View"
              aria-label="Calendar View"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'calendar' ? '#1860C3' : '#64748B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <circle cx="8" cy="14" r="1" fill={viewMode === 'calendar' ? '#1860C3' : '#64748B'} />
                <circle cx="12" cy="14" r="1" fill={viewMode === 'calendar' ? '#1860C3' : '#64748B'} />
                <circle cx="16" cy="14" r="1" fill={viewMode === 'calendar' ? '#1860C3' : '#64748B'} />
              </svg>
            </button>
          </div>

          {/* Filter Pills Row */}
          <div className="mhn-events-filter-pills-row">
            {/* Main Filter Dropdown Button */}
            <button className="mhn-filter-btn-main">
              <img src="/filters.png" alt="Filters" className="mhn-filter-icon-img" />
              <span>Filters</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Quick Filter Pill Buttons */}
            {filterPills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => setActiveFilterPill(activeFilterPill === pill.id ? null : pill.id)}
                className={`mhn-filter-pill ${activeFilterPill === pill.id ? 'mhn-filter-pill-active' : ''}`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic View: List vs Calendar */}
        {viewMode === 'list' ? (
          <div className="mhn-events-cards-grid">
            {eventsList.map((event) => (
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
