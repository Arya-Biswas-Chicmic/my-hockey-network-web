import { useMemo, useState } from 'react';
import { getRelationships, type RelationshipItem } from '@my-hockey-network/core';
import { RelationshipDirectionEnum, RelationshipTypeEnum } from '@my-hockey-network/contracts';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@/query';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { Search } from 'lucide-react';
import { EmptyState } from '@/components/features/network/EmptyState';
import { NetworkSkeletonGrid } from '@/components/features/network/NetworkSkeletonLoader';

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
}

function toConnectionMember(relationship: RelationshipItem, type: ConnectionMember['type']): ConnectionMember | null {
  const profile = relationship.counterparty;
  if (!profile?.id || !profile.displayName) return null;
  const position = profile.position
    ? `${profile.position}${profile.jerseyNumber ? ` • #${profile.jerseyNumber}` : ''}`
    : '';
  return {
    id: profile.id,
    name: profile.displayName,
    avatarUrl: resolveMediaUrl(profile.avatarUrl),
    roleTag: profile.roleTag || position || profile.primaryRole || profile.profileType || 'Member',
    teamName: profile.teamName || '',
    teamLogo: profile.teamLogo || undefined,
    location: profile.location || '',
    type,
  };
}

export function ConnectionsView({ onMessageClick, isLoading = false }: ConnectionsViewProps) {
  const [activeTab, setActiveTab] = useState<ConnectionMember['type']>('followers');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 800);
  const direction = activeTab === 'followers'
    ? RelationshipDirectionEnum.INCOMING
    : RelationshipDirectionEnum.OUTGOING;
  const relationshipsQuery = useQuery(
    `relationships:${direction}:${debouncedSearchQuery.trim().toLowerCase()}`,
    () => getRelationships({ type: RelationshipTypeEnum.FOLLOW, direction, query: debouncedSearchQuery }),
    { staleTime: 5 * 60 * 1000 },
  );
  const members = useMemo(
    () => (relationshipsQuery.data?.items || [])
      .map((relationship) => toConnectionMember(relationship, activeTab))
      .filter((member): member is ConnectionMember => member !== null),
    [relationshipsQuery.data, activeTab],
  );

  return (
    <div className="mhn-connections-view-container mhn-w-full">
      <h2 className="mhn-connections-title">Connections</h2>
      <div className="mhn-connections-search-wrapper">
        <Search className="mhn-connections-search-icon" size={18} aria-hidden="true" />
        <Input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search connections" aria-label="Search connections" className="mhn-connections-search-input" />
      </div>
      <div className="mhn-connections-tabs-row" role="tablist" aria-label="Connection direction">
        {(['followers', 'following'] as const).map((tab) => (
          <Button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`mhn-connections-tab-btn ${activeTab === tab ? 'active' : ''}`}>
            {tab === 'followers' ? 'Followers' : 'Following'}
          </Button>
        ))}
      </div>
      {isLoading || relationshipsQuery.isLoading ? (
        <NetworkSkeletonGrid count={8} />
      ) : relationshipsQuery.error ? (
        <EmptyState title="Unable to Load Connections" message="Connections could not be loaded. Please try again." iconType="server-error" actionLabel="Retry" onAction={() => void relationshipsQuery.refetch({ forceRefetch: true })} />
      ) : members.length === 0 ? (
        <EmptyState title="No Connections Found" message="There are no connections matching your criteria." iconType="connections" />
      ) : (
        <div className="mhn-network-skeleton-grid">
          {members.map((member) => (
            <article key={member.id} className="mhn-connection-member-card">
              <div className="mhn-connection-avatar-ring"><img src={member.avatarUrl} alt="" className="mhn-connection-avatar-img" /></div>
              <h4 className="mhn-connection-member-name">{member.name}</h4>
              <p className="mhn-connection-member-role">{member.roleTag}</p>
              {member.teamName && (
                <div className="mhn-connection-team-pill">
                  {member.teamLogo && <img src={member.teamLogo} alt="" className="mhn-connection-team-logo" />}
                  <span>{member.teamName}</span>
                </div>
              )}
              {member.location && <p className="mhn-connection-location-line">{member.location}</p>}
              <Button type="button" onClick={() => onMessageClick?.(member)} className="mhn-btn-connection-message" disabled={!onMessageClick}>Message</Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
