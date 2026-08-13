import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { PendingBanner } from '../components/common/PendingBanner';
import { EventCard, EventCardProps } from '../components/features/events/EventCard';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const EventsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterPill, setActiveFilterPill] = useState<string | null>(null);

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
      location: 'Austria ,Europe'
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
        <div className="events-pills-row">
          <img src='/hamburger.png' className='event-pills-row-img-left' />
          <img src='/calendar2.png' className='event-pills-row-img-right' />
        </div>
        {/* Filter Pills Row */}
        <div className="mhn-events-filter-pills-row">
          {/* Main Filter Dropdown Button */}
          <button className="mhn-filter-btn-main">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
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

        {/* Events Cards Grid (3 Columns) */}
        <div className="mhn-events-cards-grid">
          {eventsList.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </main>
    </div>
  );
};
