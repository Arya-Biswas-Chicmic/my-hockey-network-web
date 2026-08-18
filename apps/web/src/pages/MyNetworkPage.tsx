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
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

  // Fetch API network data on mount
  useEffect(() => {
    async function loadNetworkData() {
      setIsLoading(true);
      setApiErrorMsg(null);

      // 1. Pending Requests (GET /v1/relationships)
      try {
        console.log('🚀 [MyNetworkPage] Fetching GET /v1/relationships...');
        const res = await getRelationships({ direction: 'incoming', status: 'PENDING' });

        if (res?.items && Array.isArray(res.items)) {
          console.log('✅ [MyNetworkPage] Relationships items count:', res.items.length);
          const mapped: PendingRequestProps[] = res.items.map((item: RelationshipItem) => {
            const cp = item.counterparty;
            
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
        } else {
          setLivePendingRequests([]);
        }
      } catch (err: any) {
        console.warn('⚠️ [MyNetworkPage] Relationships API Error (e.g. 502):', err.message || err);
        setLivePendingRequests([]);
        if (err.statusCode === 502 || String(err.message).includes('502')) {
          setApiErrorMsg('Backend service unavailable (HTTP 502 Bad Gateway). Please try again later.');
        } else {
          setApiErrorMsg(err.message || 'Failed to load network requests.');
        }
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
        } else {
          setLiveSuggestedUsers([]);
        }
      } catch (err: any) {
        console.warn('⚠️ [MyNetworkPage] People Recommendations Warning:', err.message || err);
        setLiveSuggestedUsers([]);
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

  const filterTabs = [
    { id: 'Invitations', label: 'Invitations' },
    { id: 'People you may know', label: 'People you may know' }
  ];

  const filteredPendingRequests = livePendingRequests.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roleTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.teamName && r.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSuggestedUsers = liveSuggestedUsers.filter((u) =>
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
                    } else if (item === 'events') {
                      if (onNavigate) {
                        onNavigate('events');
                      }
                    } else {
                      setCurrentView('network');
                    }
                  }}
                />
              )}
            </aside>

            {/* Right Main Content Area */}
            <section className="mhn-network-col-main">
              {apiErrorMsg && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#DC2626',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>⚠️</span>
                  <span>{apiErrorMsg}</span>
                </div>
              )}

              {currentView === 'connections' ? (
                <ConnectionsView onMessageClick={() => onNavigate && onNavigate('messaging')} />
              ) : currentView === 'groups' ? (
                <GroupsView onViewGroup={() => {}} />
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

                  {/* Sub-Filter Tabs Row matching Figma Screenshot 2 */}
                  <div
                    className="mhn-network-filter-tabs-row"
                    style={{
                      display: 'flex',
                      width: '100%',
                      borderBottom: '1px solid #E2E8F0',
                      marginTop: '20px',
                      marginBottom: '24px',
                      gap: '0',
                    }}
                  >
                    {filterTabs.map((tab) => {
                      const isActive = activeFilterTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveFilterTab(tab.id)}
                          style={{
                            flex: 1,
                            padding: '14px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderBottom: isActive ? '3px solid #18181B' : '3px solid transparent',
                            marginBottom: '-1px',
                            color: isActive ? '#18181B' : '#71717A',
                            fontSize: '15px',
                            fontWeight: isActive ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease-in-out',
                            textAlign: 'center',
                          }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
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
                          title="No Pending Requests"
                          message={apiErrorMsg ? "Unable to load requests due to service unavailability." : "You currently have no pending network connection requests."}
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
                        title="No Suggestions Found"
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
