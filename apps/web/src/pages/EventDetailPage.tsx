import React, { useState } from 'react';
import { Header } from '../components/common/Header';

interface EventDetailPageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
  eventTitle?: string;
  bannerImage?: string;
  onBack?: () => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  onNavigate,
  onLogout,
  eventTitle = '2026 Tim Hortons NHL Heritage Classic',
  bannerImage = '/classic.png',
  onBack,
}) => {
  const [activeNavTab, setActiveNavTab] = useState('events');
  const [isReadMore, setIsReadMore] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('events');
    }
  };

  return (
    <div className="mhn-event-detail-root">
      {/* Top Header Navigation Bar */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
        userName="Jack Ruffle"
        userAvatar="/jack.png"
      />

      {/* Main Centered Content */}
      <main className="mhn-event-detail-main">
        {/* Title Bar with Back Arrow */}
        <div className="mhn-event-title-bar">
          <button
            onClick={handleBackClick}
            className="mhn-btn-back-arrow"
            aria-label="Back"
          >
            <img src="/back.png" alt="back" className='back' />
          </button>
          <h1 className="mhn-event-page-title">{eventTitle}</h1>
        </div>

        {/* Hero Event Banner */}
        <div className="mhn-event-hero-banner">
          <div className="mhn-event-banner-overlay">
            {/* Heritage Classic Banner Graphic Artwork */}
            <div className="mhn-heritage-banner-content">
              {/* Montreal Canadiens Logo */}
              <div className="mhn-team-logo-shield mhn-habs-shield">
                <span>C</span>
              </div>

              {/* Center Heritage Classic Crest */}
              <div className="mhn-heritage-crest-box">
                <div className="mhn-nhl-badge">NHL</div>
                <div className="mhn-heritage-text-large">Heritage</div>
                <div className="mhn-heritage-text-small">CLASSIC</div>
                <div className="mhn-heritage-sponsor">Tim Hortons</div>
                <div className="mhn-heritage-year">2026</div>
                <div className="mhn-heritage-city">WINNIPEG</div>
              </div>

              {/* Winnipeg Jets Logo */}
              <div className="mhn-team-logo-shield mhn-jets-shield">
                <span>✈️</span>
              </div>
            </div>
          </div>
          <img
            src={bannerImage}
            alt={eventTitle}
            className="mhn-event-banner-bg"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* 2-Column Content Grid: About on Left, Location & Time Card on Right */}
        <div className="mhn-event-content-grid">
          {/* Left Column: About */}
          <div className="mhn-event-about-col">
            <h2 className="mhn-event-section-heading">About</h2>
            <p className={`mhn-event-about-p ${!isReadMore ? 'mhn-about-truncated' : ''}`}>
              Get ready for an exciting night of ice hockey as two competitive teams face off in a
              fast-paced matchup filled with speed, skill, and intense on-ice action. Come support
              the players, enjoy the atmosphere, and experience the energy of live hockey with
              teammates, families, and fans. Whether you're following the season closely or joining
              us for your first game, this is a matchup you won't want to miss!
            </p>
            <button
              onClick={() => setIsReadMore(!isReadMore)}
              className="mhn-btn-read-more"
            >
              <span>{isReadMore ? 'Show less' : 'Show more'}</span>
              <img
                src="/arrowBottom.png"
                alt="arrow"
                width="9"
                height="4.5"
                style={{
                  width: '9px',
                  height: '4.5px',
                  transform: isReadMore ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>

            {/* Things to know */}
            <div className="mhn-things-to-know-section">
              <h2 className="mhn-event-section-heading">Things to know</h2>
              <div className="mhn-things-grid">
                {/* Column 1 */}
                <div className="mhn-things-col">
                  <div className="mhn-thing-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Guardian should be there</span>
                  </div>

                  <div className="mhn-thing-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                    <span className='labelSub'>Kid friendly</span>
                  </div>

                  <div className="mhn-thing-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                    <span className='labelSub'>Free water stations</span>
                  </div>

                  <div className="mhn-thing-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="22" height="18" rx="2" ry="2" />
                      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
                    </svg>
                    <span className='labelSub'>Free parking</span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="mhn-things-col">
                  <div className="mhn-thing-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 19v-9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9" />
                      <path d="M4 19h16" />
                    </svg>
                    <span className='labelSub'>Seating Arrangement Seated & Standing</span>
                  </div>

                  <div className="mhn-thing-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                    <span className='labelSub'>Pets not allowed</span>
                  </div>

                  <div className="mhn-thing-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 21h10" />
                      <path d="M12 21V3" />
                    </svg>
                    <span className='labelSub'>Wash rooms available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Location & Time Card */}
          <div className="mhn-event-sidebar-col">
            <div className="mhn-location-date-card">
              {/* Item 1: Location */}
              <div className="mhn-location-date-item">
                <div className="mhn-location-icon-circle">
                  <img src="/location2.png" alt="location" className='location2-event' />
                </div>
                <div className="mhn-location-date-info">
                  <h4 className="mhn-location-title">Princess Auto Stadium - Winrip...</h4>
                  <span className="mhn-location-sub">52.3 km away</span>
                </div>
                <button className="mhn-location-arrow-btn" aria-label="Location details">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* Item 2: Date & Time */}
              <div className="mhn-location-date-item">
                <div className="mhn-location-icon-circle">
                  <img src="/calendar3.png" alt="location" className='location2-event' />
                </div>
                <div className="mhn-location-date-info">
                  <h4 className="mhn-location-title">Oct 25, 2026</h4>
                  <span className="mhn-location-sub">5:00 PM - 7:00 PM</span>
                </div>
                <button className="mhn-location-arrow-btn" aria-label="Date details">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
