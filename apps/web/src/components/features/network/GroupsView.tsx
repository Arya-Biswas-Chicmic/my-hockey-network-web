import { useState } from 'react';
import Image from 'next/image';
import { getGroups, joinGroup, type GroupItem } from '@my-hockey-network/core';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { Spinner } from '@/components/common/Spinner';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@/query';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/utils/toast';
import { Search } from 'lucide-react';
import { EmptyState } from '@/components/features/network/EmptyState';
import { NetworkSkeletonGrid } from '@/components/features/network/NetworkSkeletonLoader';

interface GroupsViewProps {
  onViewGroup?: (groupId: string) => void;
}

export function GroupsView({ onViewGroup }: GroupsViewProps) {
  const [activeTab, setActiveTab] = useState<'your-groups' | 'discover'>('your-groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 800);
  const scope = activeTab === 'your-groups' ? 'mine' : 'discover';
  const groupsQuery = useQuery(
    `groups:${scope}:${debouncedSearchQuery.trim().toLowerCase()}`,
    () => getGroups({ scope, search: debouncedSearchQuery.trim() || undefined, limit: 40 }),
    { staleTime: 5 * 60 * 1000 },
  );

  const handleGroupAction = async (group: GroupItem) => {
    if (activeTab === 'your-groups') {
      onViewGroup?.(group.id);
      return;
    }
    setJoiningGroupId(group.id);
    try {
      const response = await joinGroup(group.id);
      if (response.pendingGuardianApproval) {
        showInfoToast('Your join request is waiting for guardian approval.');
      } else {
        showSuccessToast(`Joined ${group.name}.`);
      }
      await groupsQuery.refetch({ forceRefetch: true });
    } catch (error) {
      showErrorToast(error);
    } finally {
      setJoiningGroupId(null);
    }
  };

  return (
    <div className="mhn-groups-view-container">
      <div className="mhn-groups-header-box">
        <h2 className="mhn-groups-main-title">Groups</h2>
        <p className="mhn-groups-main-subtitle">Connect with players, coaches, clubs & scouts to take your game further.</p>
      </div>
      <div className="mhn-groups-search-box">
        <div className="mhn-groups-search-input-wrapper">
          <Search className="mhn-groups-search-icon" size={18} aria-hidden="true" />
          <Input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search groups" aria-label="Search groups" className="mhn-groups-search-input" />
        </div>
      </div>
      <div className="mhn-groups-tabs-bar" role="tablist" aria-label="Group lists">
        {(['your-groups', 'discover'] as const).map((tab) => (
          <Button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`mhn-groups-tab-btn ${activeTab === tab ? 'active' : ''}`}>
            <span>{tab === 'your-groups' ? 'Your Groups' : 'Discover'}</span>
            {activeTab === tab && <span className="mhn-groups-tab-line" />}
          </Button>
        ))}
      </div>

      {groupsQuery.isLoading ? (
        <NetworkSkeletonGrid count={4} />
      ) : groupsQuery.error ? (
        <EmptyState title="Unable to Load Groups" message="Groups could not be loaded. Please try again." iconType="server-error" actionLabel="Retry" onAction={() => void groupsQuery.refetch({ forceRefetch: true })} />
      ) : !groupsQuery.data?.items.length ? (
        <EmptyState title="No Groups Found" message={activeTab === 'your-groups' ? 'You have not joined any groups yet.' : 'No discoverable groups match your search.'} iconType="search" />
      ) : (
        <div className="mhn-groups-cards-grid">
          {groupsQuery.data.items.map((group) => (
            <article key={group.id} className="mhn-group-card">
              <div className="mhn-group-card-banner"><Image src="/cover.png" alt="" fill className="mhn-group-banner-img" /></div>
              <div className="mhn-group-card-body">
                <h3 className="mhn-group-title">{group.name}</h3>
                <p className="mhn-group-members">{group.memberCount ?? 0} members</p>
                <Button type="button" className="mhn-btn-view-group" onClick={() => void handleGroupAction(group)} disabled={joiningGroupId === group.id || (activeTab === 'your-groups' && !onViewGroup)}>
                  {joiningGroupId === group.id ? <><Spinner size="sm" /><span>Joining...</span></> : activeTab === 'your-groups' ? 'View Group' : 'Join Group'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
