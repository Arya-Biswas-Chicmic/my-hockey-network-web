import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { PendingBanner } from '../components/common/PendingBanner';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('profile');
  const [activeProfileTab, setActiveProfileTab] = useState<'pics' | 'stats' | 'about'>('pics');
  const [activeAboutSection, setActiveAboutSection] = useState<'intro' | 'details' | 'awards'>('intro');

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <div className="mhn-profile-page-root">
      {/* Top Header Navigation Bar */}
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

      {/* Main Centered Content Container */}
      <main className="mhn-profile-main-container">
        {/* Profile Hero Card */}
        <div className="mhn-profile-hero-card">
          {/* Cover Banner Area */}
          <div className="mhn-profile-cover-banner">
            {/* Edit Cover Pencil Button */}
            <button className="mhn-btn-edit-cover" aria-label="Edit cover photo">
              <img src='/edit2.png' className='edit2-icon' alt='edit-icon' />
            </button>
          </div>

          {/* Profile Header Content Row */}
          <div className="mhn-profile-header-content">
            {/* Overlapping Avatar Circle */}
            <div className="mhn-profile-avatar-outer">
              <div className="mhn-profile-avatar-inner">
                <img
                  src="/userPlaceholder.png"
                  alt="Jack Ruffle"
                  className="mhn-profile-hero-avatar-img"
                />
              </div>
            </div>

            {/* User Meta & Action Buttons */}
            <div className="mhn-profile-meta-and-actions">
              <div className="mhn-profile-text-meta">
                <h2 className="mhn-profile-hero-name">Jack Ruffle</h2>
                <p className="mhn-profile-hero-role">Player</p>
                <div className="mhn-profile-hero-stats">
                  <span><strong>0</strong> Followers</span>
                  <span><strong>0</strong> Following</span>
                </div>
              </div>

              <div className="mhn-profile-action-buttons">
                <button
                  onClick={() => alert('Share profile link copied!')}
                  className="mhn-btn-share-profile"
                >
                 <div className='share-profile-text'>Share Profile</div>
                </button>
                <button
                  onClick={() => alert('Edit profile modal')}
                  className="mhn-btn-edit-profile"
                >
                  <div className='edit-profile-text'>Edit Profile</div>
                   
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content Navigation Tabs Bar */}
          <div className="mhn-profile-tabs-bar">
            <button
              onClick={() => setActiveProfileTab('pics')}
              className={`mhn-profile-tab-btn ${activeProfileTab === 'pics' ? 'mhn-profile-tab-active' : ''}`}
            >
              <span>Pics</span>
              {activeProfileTab === 'pics' && <div className="mhn-profile-tab-indicator" />}
            </button>
            <button
              onClick={() => setActiveProfileTab('stats')}
              className={`mhn-profile-tab-btn ${activeProfileTab === 'stats' ? 'mhn-profile-tab-active' : ''}`}
            >
              <span>Stats</span>
              {activeProfileTab === 'stats' && <div className="mhn-profile-tab-indicator" />}
            </button>
            <button
              onClick={() => setActiveProfileTab('about')}
              className={`mhn-profile-tab-btn ${activeProfileTab === 'about' ? 'mhn-profile-tab-active' : ''}`}
            >
              <span>About</span>
              {activeProfileTab === 'about' && <div className="mhn-profile-tab-indicator" />}
            </button>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className={`mhn-profile-tab-content-card ${activeProfileTab === 'about' ? 'mhn-about-card-padding-override' : ''}`}>
          {/* PICS TAB */}
          {activeProfileTab === 'pics' && (
            <div className="mhn-profile-empty-state">
              <div className="mhn-hockey-net-icon-box">
                <img src='/noPost.png' alt='No Post' />
              </div>

              <span className="mhn-empty-state-title">No Post</span>
            </div>
          )}

          {/* STATS TAB */}
          {activeProfileTab === 'stats' && (
            <div className="mhn-profile-empty-state">
              {/* Crossed Hockey Sticks Icon Graphic */}
              <div className="mhn-crossed-sticks-box">
                <div className="mhn-hockey-net-icon-box">
                  <img src='/noStats.png' alt='No Stats' />
                </div>
              </div>
              <span className="mhn-empty-state-title">No Stats</span>
            </div>
          )}

          {/* ABOUT TAB */}
          {activeProfileTab === 'about' && (
            <div className="mhn-about-2col-container">
              {/* Left Sidebar */}
              <div className="mhn-about-sidebar">
                <h3 className="mhn-about-sidebar-title">About</h3>

                <nav className="mhn-about-menu-nav">
                  <button
                    onClick={() => setActiveAboutSection('intro')}
                    className={`mhn-about-menu-btn ${activeAboutSection === 'intro' ? 'mhn-about-btn-active' : ''}`}
                  >
                    Intro
                  </button>
                  <button
                    onClick={() => setActiveAboutSection('details')}
                    className={`mhn-about-menu-btn ${activeAboutSection === 'details' ? 'mhn-about-btn-active' : ''}`}
                  >
                    Personal details
                  </button>
                  <button
                    onClick={() => setActiveAboutSection('awards')}
                    className={`mhn-about-menu-btn ${activeAboutSection === 'awards' ? 'mhn-about-btn-active' : ''}`}
                  >
                    Awards
                  </button>
                </nav>
              </div>

              {/* Right Detail Panel */}
              <div className="mhn-about-main-panel">
                {activeAboutSection === 'intro' && (
                  <div className="mhn-about-section-content">
                    <p className="mhn-about-placeholder-text">No intro added yet.</p>
                  </div>
                )}
                {activeAboutSection === 'details' && (
                  <div className="mhn-about-section-content">
                    <p className="mhn-about-placeholder-text">No personal details added yet.</p>
                  </div>
                )}
                {activeAboutSection === 'awards' && (
                  <div className="mhn-about-section-content">
                    <p className="mhn-about-placeholder-text">No awards added yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
