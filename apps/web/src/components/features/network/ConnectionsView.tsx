'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { followUser, getRelationships, type RelationshipItem } from '@my-hockey-network/core';
import { RelationshipDirectionEnum, RelationshipTypeEnum } from '@my-hockey-network/contracts';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { EmptyState } from '@/components/features/network/EmptyState';
import { NetworkSkeletonGrid } from '@/components/features/network/NetworkSkeletonLoader';
import { getConnectionDemoMembers } from '@/demo-data/connections';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@/query';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/utils/toast';

export interface ConnectionMember {
  id: string;
  name: string;
  avatarUrl: string;
  roleTag: string;
  teamName: string;
  teamLogo?: string;
  location: string;
  type: 'followers' | 'following';
}

interface ConnectionsViewProps {
  onMessageClick?: (member: ConnectionMember) => void;
  isLoading?: boolean;
  initialTab?: ConnectionMember['type'];
}

function toConnectionMember(relationship: RelationshipItem, type: ConnectionMember['type']): ConnectionMember | null {
  const profile = relationship.counterparty;
  if (!profile?.id || !profile.displayName) return null;
  const position = profile.position ? `${profile.position}${profile.jerseyNumber ? ` • #${profile.jerseyNumber}` : ''}` : '';
  return {
    id: profile.id,
    name: profile.displayName,
    avatarUrl: resolveMediaUrl(profile.avatarUrl),
    roleTag: profile.roleTag || position || profile.primaryRole || profile.profileType || 'Member',
    teamName: profile.teamName || '',
    teamLogo: profile.teamLogo || undefined,
    location: profile.location || profile.city || '',
    type,
  };
}

export function ConnectionsView({ onMessageClick, isLoading = false, initialTab = 'following' }: Readonly<ConnectionsViewProps>) {
  const [activeTab, setActiveTab] = useState<ConnectionMember['type']>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingIds, setFollowingIds] = useState<ReadonlySet<string>>(new Set());
  const debouncedSearchQuery = useDebounce(searchQuery, 800);
  const direction = activeTab === 'followers' ? RelationshipDirectionEnum.INCOMING : RelationshipDirectionEnum.OUTGOING;
  const relationshipsQuery = useQuery(
    `relationships:${direction}:${debouncedSearchQuery.trim().toLowerCase()}`,
    () => getRelationships({ type: RelationshipTypeEnum.FOLLOW, direction, query: debouncedSearchQuery }),
    { staleTime: 5 * 60 * 1000 },
  );

  const members = useMemo(() => {
    const apiMembers = (relationshipsQuery.data?.items || [])
      .map((relationship) => toConnectionMember(relationship, activeTab))
      .filter((member): member is ConnectionMember => member !== null);
    const existingIds = new Set(apiMembers.map((member) => member.id));
    const normalizedSearch = debouncedSearchQuery.trim().toLowerCase();
    const demoMembers = getConnectionDemoMembers(activeTab)
      .filter((member) => !existingIds.has(member.id))
      .filter((member) => !normalizedSearch || `${member.name} ${member.roleTag} ${member.teamName} ${member.location}`.toLowerCase().includes(normalizedSearch));
    return [...apiMembers, ...demoMembers];
  }, [relationshipsQuery.data, activeTab, debouncedSearchQuery]);

  const handleMemberAction = async (member: ConnectionMember) => {
    if (activeTab === 'following') {
      if (onMessageClick) onMessageClick(member);
      else showInfoToast('Messaging will open when this screen is connected to navigation.');
      return;
    }
    if (member.id.startsWith('demo-')) {
      setFollowingIds((current) => new Set(current).add(member.id));
      showInfoToast(`${member.name} is preview data. The live Follow API was not called.`);
      return;
    }
    try {
      await followUser({ type: 'PROFILE', id: member.id });
      setFollowingIds((current) => new Set(current).add(member.id));
      showSuccessToast(`You are now following ${member.name}.`);
    } catch (error: unknown) {
      showErrorToast(error, `Could not follow ${member.name}.`);
    }
  };

  return (
    <div className="mhn-connections-view-container mhn-w-full">
      <div className="mhn-connections-header">
        <h2 className="mhn-connections-title">Connections</h2>
        <div className="mhn-connections-search-wrapper">
          <Search className="mhn-connections-search-icon" size={18} aria-hidden="true" />
          <Input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search" aria-label="Search connections" className="mhn-connections-search-input" />
        </div>
      </div>
      <div className="mhn-connections-tabs-row" role="tablist" aria-label="Connection direction">
        {(['following', 'followers'] as const).map((tab) => (
          <Button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`mhn-connections-tab-btn ${activeTab === tab ? 'active' : ''}`}>
            {tab === 'following' ? 'Following' : 'Followers'}
          </Button>
        ))}
      </div>
      {isLoading || relationshipsQuery.isLoading ? (
        <NetworkSkeletonGrid count={8} />
      ) : members.length === 0 ? (
        <EmptyState title="No Connections Found" message="There are no connections matching your criteria." iconType="connections" />
      ) : (
        <>
          {relationshipsQuery.error ? (
            <div className="mhn-connections-api-notice" role="status">
              <span>Live connections could not be loaded. Showing preview profiles.</span>
              <Button type="button" variant="link" onClick={() => void relationshipsQuery.refetch({ forceRefetch: true })}>Retry</Button>
            </div>
          ) : null}
          <div className="mhn-connections-grid">
            {members.map((member) => (
              <article key={member.id} className="mhn-connection-member-card">
                <div className="mhn-connection-avatar-ring"><Image src={member.avatarUrl || '/userPlaceholder.webp'} alt={member.name} width={84} height={84} className="mhn-connection-avatar-img" /></div>
                <h3 className="mhn-connection-member-name">{member.name}</h3>
                <p className="mhn-connection-member-role">{member.roleTag}</p>
                {member.teamName ? <div className="mhn-connection-team-pill">{member.teamLogo ? <Image src={member.teamLogo} alt="" width={16} height={16} className="mhn-connection-team-logo" /> : null}<span>{member.teamName}</span></div> : null}
                {member.location ? <p className="mhn-connection-location-line">{member.location}</p> : null}
                <Button type="button" onClick={() => void handleMemberAction(member)} className="mhn-btn-connection-message">
                  {activeTab === 'following' ? 'Message' : followingIds.has(member.id) ? 'Following' : 'Follow'}
                </Button>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
