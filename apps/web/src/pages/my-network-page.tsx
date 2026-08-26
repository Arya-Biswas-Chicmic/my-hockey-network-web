import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import React, { useState, useEffect } from 'react';
import { Header, NoDataFound, ServerDown } from '@/components/common';
import { ManageNetworkCard } from '@/components/features/network/ManageNetworkCard';
import { ProfileSummaryCard } from '@/components/features/home/ProfileSummaryCard';
import { GroupsView } from '@/components/features/network/GroupsView';
import { GroupDetailView } from '@/components/features/network/GroupDetailView';
import { ConnectionsView } from '@/components/features/network/ConnectionsView';
import { PendingRequestCard, PendingRequestProps } from '@/components/features/network/PendingRequestCard';
import { SuggestedUserCard, SuggestedUserProps } from '@/components/features/network/SuggestedUserCard';
import { NetworkSkeletonGrid } from '@/components/features/network/NetworkSkeletonLoader';
import { EmptyState } from '@/components/features/network/EmptyState';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/hooks/use-auth';
import { resolveCoverUrl } from '@/utils/mediaUtils';
import {
  getRelationships,
  getPeopleYouMayKnow,
  acceptRelationship,
  declineRelationship,
  followUser,
  RelationshipItem,
  RecommendedPerson,
} from '@my-hockey-network/core';

import { QueryKeys, NavTabEnum, NetworkViewModeEnum } from '@my-hockey-network/contracts';
import { useQuery } from '@/query';
import { Search } from 'lucide-react';
import { extractErrorMessage, getApiErrorStatus } from '@/utils/toast';


interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const MyNetworkPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { user, loadAuthMe } = useAuth();
  const [activeNavTab, setActiveNavTab] = useState<NavTabEnum>(NavTabEnum.MY_NETWORK);
  const [currentView, setCurrentView] = useState<NetworkViewModeEnum>(NetworkViewModeEnum.NETWORK);
  const [selectedGroupId, setSelectedGroupId] = useState('g1');
  const [activeFilterTab, setActiveFilterTab] = useState('Invitations');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  const [livePendingRequests, setLivePendingRequests] = useState<PendingRequestProps[]>([]);
  const [liveSuggestedUsers, setLiveSuggestedUsers] = useState<SuggestedUserProps[]>([]);
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

  const qParam = debouncedSearchQuery && debouncedSearchQuery.trim().length >= 2 ? debouncedSearchQuery.trim() : undefined;

  const { data: relData, isLoading: isRelLoading, error: relError } = useQuery(
    `${QueryKeys.NETWORK_RELATIONSHIPS}:${qParam || 'all'}`,
    async () => getRelationships({ direction: 'incoming', status: 'PENDING', query: qParam }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: peopleData, isLoading: isPeopleLoading } = useQuery(
    `${QueryKeys.PEOPLE_YOU_MAY_KNOW}:${qParam || 'all'}`,
    async () => getPeopleYouMayKnow({ limit: 10, query: qParam }),
    { staleTime: 5 * 60 * 1000 }
  );

  const isLoading = isRelLoading || isPeopleLoading;

  useEffect(() => {
    if (relError) {
      const message = extractErrorMessage(relError, 'Failed to load network requests.');
      if (getApiErrorStatus(relError) === 502 || message.includes('502')) {
        setApiErrorMsg('Backend service unavailable (HTTP 502 Bad Gateway). Please try again later.');
      } else {
        setApiErrorMsg(message);
      }
    } else {
      setApiErrorMsg(null);
    }
  }, [relError]);

  useEffect(() => {
    if (relData?.items && Array.isArray(relData.items)) {
      const mapped: PendingRequestProps[] = relData.items.map((item: RelationshipItem) => {
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
          name: cp?.displayName || item.source?.displayName || '-',
          avatarUrl: cp?.avatarUrl || item.source?.avatarUrl || '/userPlaceholder.png',
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
  }, [relData]);

  useEffect(() => {
    if (peopleData?.items && Array.isArray(peopleData.items)) {
      const mapped: SuggestedUserProps[] = peopleData.items.map((item: RecommendedPerson) => {
        const prof = item.profile || item;
        let formattedRole = prof.roleTag || '';
        if (!formattedRole) {
          if (prof.position && prof.jerseyNumber) {
            formattedRole = `${prof.position} • #${prof.jerseyNumber}`;
          } else if (prof.position) {
            formattedRole = prof.position;
          } else {
            formattedRole = prof.primaryRole || prof.profileType || '-';
          }
        }
        return {
          id: prof.id || prof.profileId || `rec_${Math.random()}`,
          name: prof.displayName || prof.name || '-',
          avatarUrl: prof.avatarUrl || '/userPlaceholder.png',
          roleTag: formattedRole,
          teamName: prof.teamName || '-',
          teamLogo: prof.teamLogo || '/kcBlue.png',
          location: prof.location || '-',
          isFollowing: false,
        };
      });
      setLiveSuggestedUsers(mapped);
    } else {
      setLiveSuggestedUsers([]);
    }
  }, [peopleData]);

  const handleTabChange = (tab: string) => {
    if (Object.values(NavTabEnum).includes(tab as NavTabEnum)) {
      setActiveNavTab(tab as NavTabEnum);
    }
    if (tab === NavTabEnum.MY_NETWORK || tab === 'network') {
      setCurrentView(NetworkViewModeEnum.NETWORK);
    }
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      await acceptRelationship(id);
      setLivePendingRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error('Accept request error:', err);
    }
  };

  const handleIgnoreRequest = async (id: string) => {
    try {
      await declineRelationship(id);
      setLivePendingRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error('Decline request error:', err);
    }
  };

  const handleFollowUser = async (id: string) => {
    try {
      await followUser({ type: 'PROFILE', id });
      setLiveSuggestedUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isFollowing: true } : u)));
    } catch (err) {
      console.error('Follow user error:', err);
    }
  };





  const filterTabs = [
    { id: 'Invitations', label: 'Invitations' },
    { id: 'People you may know', label: 'People you may know' }
  ];

  const filteredPendingRequests = livePendingRequests.filter((r) =>
    r.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    r.roleTag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    (r.teamName && r.teamName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  );

  const filteredSuggestedUsers = liveSuggestedUsers.filter((u) =>
    u.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    u.roleTag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    (u.teamName && u.teamName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  );

  return (
    <div className="mhn-network-page-root">
      {/* Header */}
      <Header 
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
      />

      {/* Main Container */}
      <main className="mhn-network-main-layout">
        {currentView === NetworkViewModeEnum.GROUP_DETAIL ? (
          <GroupDetailView 
            groupId={selectedGroupId}
            onBackToGroups={() => setCurrentView(NetworkViewModeEnum.GROUPS)}
          />
        ) : (
          <>
            {/* Left Column */}
            <aside className="mhn-network-col-left">
              {currentView === NetworkViewModeEnum.GROUPS ? (
                <ProfileSummaryCard 
                  coverUrl={resolveCoverUrl(user?.profile?.coverImageUrl || user?.profile?.coverUrl, "/cover.png")}
                  location={user?.profile?.city || "-"}
                  teamLogo="/HC.png"
                  onPostClick={() => {
                    if (onNavigate) onNavigate('home');
                  }}
                />
              ) : (
                <ManageNetworkCard 
                  bannerUrl={resolveCoverUrl(user?.profile?.coverImageUrl || user?.profile?.coverUrl, "/cover.png")}
                  location={user?.profile?.city || "-"}
                  teamLogo="/HC.png"
                  followersCount="-"
                  followingCount="-"
                  onMenuItemClick={(item) => {
                    if (item === 'groups') {
                      setCurrentView(NetworkViewModeEnum.GROUPS);
                    } else if (item === 'connectors' || item === 'connections') {
                      setCurrentView(NetworkViewModeEnum.CONNECTIONS);
                    } else if (item === 'events') {
                      if (onNavigate) {
                        onNavigate('events');
                      }
                    } else {
                      setCurrentView(NetworkViewModeEnum.NETWORK);
                    }
                  }}
                />
              )}
            </aside>

            {/* Right Main Content Area */}
            <section className="mhn-network-col-main">
              {apiErrorMsg && (
                <div className="mhn-network-api-error-banner">
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
                      <Search className="mhn-network-search-icon" size={18} aria-hidden="true" />
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="mhn-network-search-input"
                      />
                    </div>
                  </div>

                  {/* Sub-Filter Tabs Row matching Figma Screenshot 2 */}
                  <div className="mhn-network-filter-tabs-row">
                    {filterTabs.map((tab) => {
                      const isActive = activeFilterTab === tab.id;
                      return (
                        <Button
                          key={tab.id}
                          onClick={() => setActiveFilterTab(tab.id)}
                          className={`mhn-network-filter-tab-btn ${isActive ? 'active' : ''}`}
                        >
                          {tab.label}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Pending Requests Section */}
                  {activeFilterTab === 'Invitations' && (
                    <div className="mhn-network-section">
                      <div className="mhn-network-section-header">
                        <h3 className="mhn-network-section-title">Pending Requests</h3>
                        {filteredPendingRequests.length > 0 && (
                          <Button className="mhn-network-view-all">View all</Button>
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
                            <PendingRequestCard
                              key={request.id}
                              {...request}
                              onAccept={handleAcceptRequest}
                              onIgnore={handleIgnoreRequest}
                            />
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
                        <Button className="mhn-network-view-all">View all</Button>
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
                          <SuggestedUserCard
                            key={user.id}
                            {...user}
                            onFollow={handleFollowUser}
                          />
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
