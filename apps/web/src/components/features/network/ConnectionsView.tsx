import { Button } from '../../common/Button';
import { Input } from '../../common/FormControls';
import React, { useState } from 'react';
import { useDebounce } from '../../../hooks/use-debounce';
import { EmptyState } from './EmptyState';
import { NetworkSkeletonGrid } from './NetworkSkeletonLoader';

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

const sampleConnections: ConnectionMember[] = [
  {
    id: 'c1',
    name: 'Connor McDavid',
    avatarUrl: '/connor.png',
    roleTag: 'C • #97',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
  {
    id: 'c2',
    name: 'Lucas Bennett',
    avatarUrl: '/lucas.png',
    roleTag: 'Head Coach • U16 AAA',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
  {
    id: 'c3',
    name: 'Columbus Blue Jackets',
    avatarUrl: '/columbus.png',
    roleTag: 'Team',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
  {
    id: 'c4',
    name: 'Jack Hughes',
    avatarUrl: '/jack.png',
    roleTag: 'C • #86',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
  {
    id: 'c5',
    name: 'Connor McDavid',
    avatarUrl: '/connor.png',
    roleTag: 'C • #97',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
  {
    id: 'c6',
    name: 'Lucas Bennett',
    avatarUrl: '/lucas.png',
    roleTag: 'Head Coach • U16 AAA',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
  {
    id: 'c7',
    name: 'Columbus Blue Jackets',
    avatarUrl: '/columbus.png',
    roleTag: 'Team',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
  {
    id: 'c8',
    name: 'Jack Hughes',
    avatarUrl: '/jack.png',
    roleTag: 'C • #86',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
  {
    id: 'c9',
    name: 'Connor McDavid',
    avatarUrl: '/connor.png',
    roleTag: 'C • #97',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
  {
    id: 'c10',
    name: 'Lucas Bennett',
    avatarUrl: '/lucas.png',
    roleTag: 'Head Coach • U16 AAA',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
  {
    id: 'c11',
    name: 'Columbus Blue Jackets',
    avatarUrl: '/columbus.png',
    roleTag: 'Team',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
  {
    id: 'c12',
    name: 'Jack Hughes',
    avatarUrl: '/jack.png',
    roleTag: 'C • #86',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria ,Europe',
    type: 'followers',
  },
];

interface ConnectionsViewProps {
  onMessageClick?: (member: ConnectionMember) => void;
  isLoading?: boolean;
}

export const ConnectionsView: React.FC<ConnectionsViewProps> = ({ onMessageClick, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  const filteredMembers = sampleConnections.filter(
    (item) =>
      item.type === activeTab &&
      (!debouncedSearchQuery.trim() ||
        item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.roleTag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.teamName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  );

  return (
    <div className="mhn-connections-view-container mhn-w-full">
      {/* 1. Page Header Title matching Figma */}
      <h2 className="mhn-connections-title">
        Connections
      </h2>

      {/* 2. Full Width Search Input Bar */}
      <div
        className="mhn-connections-search-wrapper"
      >
        <svg
          className="mhn-connections-search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          className="mhn-connections-search-input"
        />
      </div>

      {/* 3. Followers / Following Sub-Tabs matching Figma Screenshot */}
      <div
        className="mhn-connections-tabs-row"
      >
        <Button
          onClick={() => setActiveTab('followers')}
          className={`mhn-connections-tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
        >
          Followers
        </Button>

        <Button
          onClick={() => setActiveTab('following')}
          className={`mhn-connections-tab-btn ${activeTab === 'following' ? 'active' : ''}`}
        >
          Following
        </Button>
      </div>

      {/* 4. 4-Column Grid of Connection Cards matching Figma */}
      {isLoading ? (
        <NetworkSkeletonGrid count={8} />
      ) : filteredMembers.length === 0 ? (
        <EmptyState 
          title="No Connections Found"
          message="There are no connections or followers matching your criteria."
          iconType="connections"
        />
      ) : (
        <div
          className="mhn-network-skeleton-grid"
        >
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="mhn-connection-member-card"
            >
              {/* Avatar Circle with blue ring */}
              <div
                className="mhn-connection-avatar-ring"
              >
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="mhn-connection-avatar-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                  }}
                />
              </div>

              {/* User Name */}
              <h4 className="mhn-connection-member-name">
                {member.name}
              </h4>

              {/* Role Tag */}
              <p className="mhn-connection-member-role">
                {member.roleTag}
              </p>

              {/* Team Pill Badge */}
              <div
                className="mhn-connection-team-pill"
              >
                {member.teamLogo && (
                  <img
                    src={member.teamLogo}
                    alt={member.teamName}
                    className="mhn-connection-team-logo"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/HC.png';
                    }}
                  />
                )}
                <span>{member.teamName}</span>
              </div>

              {/* Location Line */}
              <div
                className="mhn-connection-location-line"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{member.location}</span>
              </div>

              {/* Primary Action Button: Message */}
              <Button
                type="button"
                onClick={() => onMessageClick && onMessageClick(member)}
                className="mhn-btn-connection-message"
              >
                Message
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
