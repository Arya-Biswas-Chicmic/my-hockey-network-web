import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { ManageNetworkCard } from '../components/features/network/ManageNetworkCard';
import { SuggestedUserCard, SuggestedUserProps } from '../components/features/network/SuggestedUserCard';
import { PendingRequestCard, PendingRequestProps } from '../components/features/network/PendingRequestCard';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const MyNetworkPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('network');
  const [activeFilterTab, setActiveFilterTab] = useState('Invitations');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  // Sample pending requests matching Figma design screenshot
  const pendingRequests: PendingRequestProps[] = [
    {
      id: 'r1',
      name: 'Connor McDavid',
      avatarUrl: '/connor.png',
      roleTag: 'C • #97',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe'
    },
    {
      id: 'r2',
      name: 'Lucas Bennett',
      avatarUrl: '/lucas.png',
      roleTag: 'Head Coach • U18 AAA',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe'
    },
    {
      id: 'r3',
      name: 'Columbus Blue Jackets',
      avatarUrl: '/columbus.png',
      roleTag: 'Team',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe'
    },
    {
      id: 'r4',
      name: 'Jack Hughes',
      avatarUrl: '/jack.png',
      roleTag: 'C • #86',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe'
    }
  ];

  // Sample suggested users matching Figma design screenshot
  const suggestedUsers: SuggestedUserProps[] = [
    {
      id: 's1',
      name: 'Connor McDavid',
      avatarUrl: '/connor.png',
      roleTag: 'C • #97',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
      isFollowing: false
    },
    {
      id: 's2',
      name: 'Lucas Bennett',
      avatarUrl: '/lucas.png',
      roleTag: 'Head Coach • U18 AAA',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
      isFollowing: false
    },
    {
      id: 's3',
      name: 'Columbus Blue Jackets',
      avatarUrl: '/columbus.png',
      roleTag: 'Team',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
      isFollowing: false
    },
    {
      id: 's4',
      name: 'Jack Hughes',
      avatarUrl: '/jack.png',
      roleTag: 'C • #86',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
      isFollowing: false
    }
  ];

  const filterTabs = [
    { id: 'Invitations', label: 'Invitations' },
    { id: 'People you may know', label: 'People you may know' }
  ];

  const filteredPendingRequests = pendingRequests.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roleTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.teamName && r.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSuggestedUsers = suggestedUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.roleTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.teamName && u.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="mhn-network-page-root">
      {/* Top Header Navbar */}
      <Header 
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
        userName="Jack Ruffle"
        userAvatar="/jack.png"
      />

      {/* Main 2-Column Layout */}
      <main className="mhn-network-main-layout">
        {/* Left Column: Profile Card & Manage Menu */}
        <aside className="mhn-network-col-left">
          <ManageNetworkCard 
            name="Jack Ruffle"
            role="Center • #97"
            avatarUrl="/jack.png"
            bannerUrl="/cover.png"
            location="Austria, Europe"
            teamName="HC Bregenzerwald"
            teamLogo="/HC.png"
            followersCount="1M"
            followingCount="700"
            onMenuItemClick={(item) => console.log('Clicked menu item:', item)}
          />
        </aside>

        {/* Right Main Content Area */}
        <section className="mhn-network-col-main">
          {/* Header Title Section */}
          <div className="mhn-network-header-title-box">
            <h2 className="mhn-network-main-title">Grow Your Hockey Network</h2>
            <p className="mhn-network-main-subtitle">
              Connect with players, coaches, clubs & scouts to take your game further.
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="mhn-network-search-box">
            <div className="mhn-network-search-input-wrapper">
              <svg className="mhn-network-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="mhn-network-search-input"
              />
            </div>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="mhn-network-tabs-bar">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id)}
                className={`mhn-network-tab-btn ${activeFilterTab === tab.id ? 'mhn-network-tab-active' : ''}`}
              >
                <span >{tab.label}</span>
                {activeFilterTab === tab.id && <div className="mhn-network-tab-line" />}
              </button>
            ))}
          </div>

          {/* Pending Requests Section (Shown when Invitations tab is active) */}
          {activeFilterTab === 'Invitations' && (
            <div className="mhn-network-section">
              <div className="mhn-network-section-header">
                <h3 className="mhn-network-section-title">Pending Requests</h3>
                <button className="mhn-network-view-all">View all</button>
              </div>

              <div className="mhn-pending-requests-grid">
                {filteredPendingRequests.map((request) => (
                  <PendingRequestCard key={request.id} {...request} />
                ))}
              </div>
            </div>
          )}

          {/* Suggested for You / People you may know Section */}
          <div className="mhn-network-section">
            <div className="mhn-network-section-header">
              <h3 className="mhn-network-section-title">
                {activeFilterTab === 'People you may know' ? 'People you may know' : 'Suggested for You'}
              </h3>
              <button className="mhn-network-view-all">View all</button>
            </div>

            <div className="mhn-suggested-grid">
              {filteredSuggestedUsers.map((user) => (
                <SuggestedUserCard key={user.id} {...user} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};


