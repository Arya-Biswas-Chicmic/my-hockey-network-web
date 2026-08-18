import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { ManageNetworkCard } from '../components/features/network/ManageNetworkCard';
import { ProfileSummaryCard } from '../components/features/home/ProfileSummaryCard';
import { GroupsView } from '../components/features/network/GroupsView';
import { GroupDetailView } from '../components/features/network/GroupDetailView';
import { ConnectionsView } from '../components/features/network/ConnectionsView';
import { PendingRequestCard, PendingRequestProps } from '../components/features/network/PendingRequestCard';
import { SuggestedUserCard, SuggestedUserProps } from '../components/features/network/SuggestedUserCard';
import { NetworkSkeletonGrid } from '../components/features/network/NetworkSkeletonLoader';
import { EmptyState } from '../components/features/network/EmptyState';
import {
  getRelationships,
  getPeopleYouMayKnow,
  getSuggestedPeople,
  RelationshipItem,
} from '@my-hockey-network/core';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const MyNetworkPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('network');
  const [currentView, setCurrentView] = useState<'network' | 'connections' | 'groups' | 'group-detail'>('network');
  const [selectedGroupId, setSelectedGroupId] = useState('g1');
  const [activeFilterTab, setActiveFilterTab] = useState('Invitations');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [livePendingRequests, setLivePendingRequests] = useState<PendingRequestProps[]>([]);
  const [liveSuggestedUsers, setLiveSuggestedUsers] = useState<SuggestedUserProps[]>([]);
  const [hasFetchedApi, setHasFetchedApi] = useState<boolean>(false);

  // Fetch API network data on mount
  useEffect(() => {
    async function loadNetworkData() {
      setIsLoading(true);

      // 1. Pending Requests (GET /v1/relationships)
      try {
        console.log('🚀 [MyNetworkPage] Fetching GET /v1/relationships...');
        const res = await getRelationships({ direction: 'incoming', status: 'PENDING' });
        setHasFetchedApi(true);

        if (res?.items && Array.isArray(res.items)) {
          console.log('✅ [MyNetworkPage] Relationships items count:', res.items.length);
          const mapped: PendingRequestProps[] = res.items.map((item: RelationshipItem) => {
            const cp = item.counterparty;
            
            // Format roleTag from position & jerseyNumber or primaryRole or roleTag or requestReason
            let formattedRole = cp?.roleTag || '';
            if (!formattedRole) {
              if (cp?.position && cp?.jerseyNumber) {
                formattedRole = `${cp.position} • #${cp.jerseyNumber}`;
              } else if (cp?.position) {
                formattedRole = cp.position;
              } else if (cp?.primaryRole || cp?.profileType) {
                formattedRole = cp.primaryRole || cp.profileType || '-';
              } else if (item.requestReason) {
                formattedRole = item.requestReason;
              } else {
                formattedRole = '-';
              }
            }

            return {
              id: item.id,
              name: cp?.displayName || (item.source as any)?.displayName || '-',
              avatarUrl: cp?.avatarUrl || (item.source as any)?.avatarUrl || '/userPlaceholder.png',
              roleTag: formattedRole,
              teamName: cp?.teamName || '-',
              teamLogo: cp?.teamLogo || '/kcBlue.png',
              location: cp?.location || '-',
            };
          });
          setLivePendingRequests(mapped);
        }
      } catch (err: any) {
        console.warn('⚠️ [MyNetworkPage] Relationships API Warning:', err.message || err);
      }

      // 2. People You May Know (GET /v1/recommendations/people)
      try {
        console.log('🚀 [MyNetworkPage] Fetching GET /v1/recommendations/people...');
        const peopleRes = await getPeopleYouMayKnow(10);
        if (peopleRes?.items && Array.isArray(peopleRes.items)) {
          const mapped: SuggestedUserProps[] = peopleRes.items.map((item: any) => ({
            id: item.id || item.userId || `rec_${Math.random()}`,
            name: item.displayName || item.name || '-',
            avatarUrl: item.avatarUrl || '/userPlaceholder.png',
            roleTag: item.roleTag || item.position || item.primaryRole || '-',
            teamName: item.teamName || '-',
            teamLogo: item.teamLogo || '/kcBlue.png',
            location: item.location || '-',
            isFollowing: false,
          }));
          setLiveSuggestedUsers(mapped);
        }
      } catch (err: any) {
        console.warn('⚠️ [MyNetworkPage] People Recommendations Warning:', err.message || err);
      }

      // 3. Suggested People (GET /v1/recommendations/suggested)
      try {
        console.log('🚀 [MyNetworkPage] Fetching GET /v1/recommendations/suggested...');
        await getSuggestedPeople({ limit: 10 });
      } catch (err: any) {
        console.warn('⚠️ [MyNetworkPage] Suggested Recommendations Warning:', err.message || err);
      } finally {
        setIsLoading(false);
      }
    }

    loadNetworkData();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (tab === 'network') {
      setCurrentView('network');
    }
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleViewGroup = (groupId: string) => {
    // Navigation placeholder
  };

  // Sample pending requests fallback if API hasn't returned any items and was not explicitly empty
  const pendingRequestsSample: PendingRequestProps[] = [
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

  // Sample suggested users fallback
  const suggestedUsersSample: SuggestedUserProps[] = [
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

  // Determine list items (Use pure API dynamic data when fetched, zero dummy fallbacks)
  const effectivePendingList = hasFetchedApi ? livePendingRequests : pendingRequestsSample;
  const effectiveSuggestedList = hasFetchedApi ? liveSuggestedUsers : [];

  const filteredPendingRequests = effectivePendingList.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roleTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.teamName && r.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSuggestedUsers = effectiveSuggestedList.filter((u) =>
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
      />

      {/* Main Container */}
      <main className="mhn-network-main-layout">
        {currentView === 'group-detail' ? (
          <GroupDetailView 
            groupId={selectedGroupId}
            groupName="San Jose Sharks"
            onBackToGroups={() => setCurrentView('groups')}
          />
        ) : (
          <>
            {/* Left Column */}
            <aside className="mhn-network-col-left">
              {currentView === 'groups' ? (
                <ProfileSummaryCard 
                  coverUrl="/cover.png"
                  location="Austria, Europe"
                  teamName="HC Bloemendaal"
                  teamLogo="/HC.png"
                  onPostClick={() => {
                    if (onNavigate) onNavigate('home');
                  }}
                />
              ) : (
                <ManageNetworkCard 
                  bannerUrl="/cover.png"
                  location="Austria, Europe"
                  teamName="HC Bloemendaal"
                  teamLogo="/HC.png"
                  followersCount="-"
                  followingCount="-"
                  onMenuItemClick={(item) => {
                    if (item === 'groups') {
                      setCurrentView('groups');
                    } else if (item === 'connectors' || item === 'connections') {
                      setCurrentView('connections');
                    } else {
                      setCurrentView('network');
                    }
                  }}
                />
              )}
            </aside>

            {/* Right Main Content Area */}
            <section className="mhn-network-col-main">
              {currentView === 'connections' ? (
                <ConnectionsView onMessageClick={() => onNavigate && onNavigate('messaging')} />
              ) : currentView === 'groups' ? (
                <GroupsView onViewGroup={handleViewGroup} />
              ) : (
                <>
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
                      <svg className="mhn-network-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
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
                        <span>{tab.label}</span>
                        {activeFilterTab === tab.id && <div className="mhn-network-tab-line" />}
                      </button>
                    ))}
                  </div>

                  {/* Pending Requests Section */}
                  {activeFilterTab === 'Invitations' && (
                    <div className="mhn-network-section">
                      <div className="mhn-network-section-header">
                        <h3 className="mhn-network-section-title">Pending Requests</h3>
                        {filteredPendingRequests.length > 0 && (
                          <button className="mhn-network-view-all">View all</button>
                        )}
                      </div>

                      {isLoading ? (
                        <NetworkSkeletonGrid count={4} />
                      ) : filteredPendingRequests.length === 0 ? (
                        <EmptyState 
                          title="No Pending Invitations"
                          message="You currently have no pending network connection requests."
                          iconType="invitations"
                        />
                      ) : (
                        <div className="mhn-pending-requests-grid">
                          {filteredPendingRequests.map((request) => (
                            <PendingRequestCard key={request.id} {...request} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggested for You */}
                  <div className="mhn-network-section">
                    <div className="mhn-network-section-header">
                      <h3 className="mhn-network-section-title">
                        {activeFilterTab === 'People you may know' ? 'People you may know' : 'Suggested for You'}
                      </h3>
                      {filteredSuggestedUsers.length > 0 && (
                        <button className="mhn-network-view-all">View all</button>
                      )}
                    </div>

                    {isLoading ? (
                      <NetworkSkeletonGrid count={4} />
                    ) : filteredSuggestedUsers.length === 0 ? (
                      <EmptyState 
                        title="No Data Found"
                        message="There are no user recommendations or suggestions available at the moment."
                        iconType="nodata"
                      />
                    ) : (
                      <div className="mhn-suggested-grid">
                        {filteredSuggestedUsers.map((user) => (
                          <SuggestedUserCard key={user.id} {...user} />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};
