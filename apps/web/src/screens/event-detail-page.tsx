import { Button } from '@/components/common/Button';
import Image from 'next/image';
import { FallbackImage } from '@/components/ui/fallback-image';
import React, { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Armchair, Ban, ChevronRight, CircleParking, Droplets, Smile, Toilet, Users } from 'lucide-react';

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
      />

      {/* Main Centered Content */}
      <main className="mhn-event-detail-main">
        {/* Title Bar with Back Arrow */}
        <div className="mhn-event-title-bar">
          <Button
            onClick={handleBackClick}
            className="mhn-btn-back-arrow"
            aria-label="Back"
          >
            <Image src="/back.png" alt="back" width={24} height={24} className='back' />
          </Button>
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
          <FallbackImage
            src={bannerImage}
            alt={eventTitle}
            fill
            hideOnError
            className="mhn-event-banner-bg"
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
              teammates, families, and fans. Whether you&apos;re following the season closely or joining
              us for your first game, this is a matchup you won&apos;t want to miss!
            </p>
            <Button
              onClick={() => setIsReadMore(!isReadMore)}
              className="mhn-btn-read-more"
            >
              <span>{isReadMore ? 'Show less' : 'Show more'}</span>
              <Image
                src="/arrowBottom.png"
                alt="arrow"
                width={9}
                height={5}
                className={`mhn-arrow-rotate ${isReadMore ? 'rotated' : ''}`}
              />
            </Button>

            {/* Things to know */}
            <div className="mhn-things-to-know-section">
              <h2 className="mhn-event-section-heading">Things to know</h2>
              <div className="mhn-things-grid">
                {/* Column 1 */}
                <div className="mhn-things-col">
                  <div className="mhn-thing-item">
                    <Users size={18} aria-hidden="true" />
                    <span>Guardian should be there</span>
                  </div>

                  <div className="mhn-thing-item">
                    <Smile size={18} aria-hidden="true" />
                    <span className='labelSub'>Kid friendly</span>
                  </div>

                  <div className="mhn-thing-item">
                    <Droplets size={18} aria-hidden="true" />
                    <span className='labelSub'>Free water stations</span>
                  </div>

                  <div className="mhn-thing-item">
                    <CircleParking size={18} aria-hidden="true" />
                    <span className='labelSub'>Free parking</span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="mhn-things-col">
                  <div className="mhn-thing-item">
                    <Armchair size={18} aria-hidden="true" />
                    <span className='labelSub'>Seating Arrangement Seated & Standing</span>
                  </div>

                  <div className="mhn-thing-item">
                    <Ban size={18} aria-hidden="true" />
                    <span className='labelSub'>Pets not allowed</span>
                  </div>

                  <div className="mhn-thing-item">
                    <Toilet size={18} aria-hidden="true" />
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
                  <Image src="/location2.png" alt="location" width={40} height={40} className='location2-event' />
                </div>
                <div className="mhn-location-date-info">
                  <h4 className="mhn-location-title">Princess Auto Stadium - Winrip...</h4>
                  <span className="mhn-location-sub">52.3 km away</span>
                </div>
                <Button className="mhn-location-arrow-btn" aria-label="Location details">
                  <ChevronRight size={16} aria-hidden="true" />
                </Button>
              </div>

              {/* Item 2: Date & Time */}
              <div className="mhn-location-date-item">
                <div className="mhn-location-icon-circle">
                  <Image src="/calendar3.png" alt="calendar" width={40} height={40} className='location2-event' />
                </div>
                <div className="mhn-location-date-info">
                  <h4 className="mhn-location-title">Oct 25, 2026</h4>
                  <span className="mhn-location-sub">5:00 PM - 7:00 PM</span>
                </div>
                <Button className="mhn-location-arrow-btn" aria-label="Date details">
                  <ChevronRight size={16} aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
