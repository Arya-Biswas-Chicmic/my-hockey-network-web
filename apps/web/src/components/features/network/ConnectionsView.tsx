import React, { useState } from 'react';
import { EmptyState } from './EmptyState';

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
    location: 'Austria, Europe',
    type: 'followers',
  },
  {
    id: 'c2',
    name: 'Lucas Bennett',
    avatarUrl: '/lucas.png',
    roleTag: 'Head Coach • U16 AAA',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria, Europe',
    type: 'followers',
  },
  {
    id: 'c3',
    name: 'Columbus Blue Jackets',
    avatarUrl: '/columbus.png',
    roleTag: 'Team',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria, Europe',
    type: 'followers',
  },
  {
    id: 'c4',
    name: 'Jack Hughes',
    avatarUrl: '/jack.png',
    roleTag: 'C • #86',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria, Europe',
    type: 'followers',
  },
  {
    id: 'c5',
    name: 'Connor McDavid',
    avatarUrl: '/connor.png',
    roleTag: 'C • #97',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria, Europe',
    type: 'followers',
  },
  {
    id: 'c6',
    name: 'Lucas Bennett',
    avatarUrl: '/lucas.png',
    roleTag: 'Head Coach • U16 AAA',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria, Europe',
    type: 'followers',
  },
  {
    id: 'c7',
    name: 'Columbus Blue Jackets',
    avatarUrl: '/columbus.png',
    roleTag: 'Team',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria, Europe',
    type: 'followers',
  },
  {
    id: 'c8',
    name: 'Jack Hughes',
    avatarUrl: '/jack.png',
    roleTag: 'C • #86',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria, Europe',
    type: 'followers',
  },
  {
    id: 'c9',
    name: 'Connor McDavid',
    avatarUrl: '/connor.png',
    roleTag: 'C • #97',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria, Europe',
    type: 'followers',
  },
  {
    id: 'c10',
    name: 'Lucas Bennett',
    avatarUrl: '/lucas.png',
    roleTag: 'Head Coach • U16 AAA',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria, Europe',
    type: 'followers',
  },
  {
    id: 'c11',
    name: 'Columbus Blue Jackets',
    avatarUrl: '/columbus.png',
    roleTag: 'Team',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria, Europe',
    type: 'followers',
  },
  {
    id: 'c12',
    name: 'Jack Hughes',
    avatarUrl: '/jack.png',
    roleTag: 'C • #86',
    teamName: 'HC Bloemendaal',
    teamLogo: '/kcBlue.png',
    location: 'Austria, Europe',
    type: 'followers',
  },
];

interface ConnectionsViewProps {
  onMessageClick?: (member: ConnectionMember) => void;
}

export const ConnectionsView: React.FC<ConnectionsViewProps> = ({ onMessageClick }) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = sampleConnections.filter(
    (item) =>
      item.type === activeTab &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.roleTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="mhn-connections-view-container">
      {/* 1. Page Header Title matching Figma */}
      <h2 className="mhn-connections-title">Connections</h2>

      {/* 2. Full Width Search Input Bar */}
      <div className="mhn-connections-search-wrapper">
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
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          className="mhn-connections-search-input"
        />
      </div>

      {/* 3. Followers / Following Sub-Tabs matching Figma */}
      <div className="mhn-connections-tabs-row">
        <button
          onClick={() => setActiveTab('followers')}
          className={`mhn-connections-tab-btn ${activeTab === 'followers' ? 'mhn-connections-tab-active' : ''}`}
        >
          <span>Followers</span>
          {activeTab === 'followers' && <div className="mhn-connections-tab-line" />}
        </button>

        <button
          onClick={() => setActiveTab('following')}
          className={`mhn-connections-tab-btn ${activeTab === 'following' ? 'mhn-connections-tab-active' : ''}`}
        >
          <span>Following</span>
          {activeTab === 'following' && <div className="mhn-connections-tab-line" />}
        </button>
      </div>

      {/* 4. 4-Column Grid of Connection Cards matching Figma */}
      {filteredMembers.length === 0 ? (
        <EmptyState 
          title="No Connections Found"
          message="There are no connections or followers matching your criteria."
          iconType="connections"
        />
      ) : (
        <div className="mhn-connections-grid">
          {filteredMembers.map((member) => (
            <div key={member.id} className="mhn-connection-card">
              {/* Avatar Circle with blue ring */}
              <div className="mhn-connection-avatar-outer">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="mhn-connection-avatar-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                  }}
                />
              </div>

              {/* User Name & Role Tag */}
              <h4 className="mhn-connection-name">{member.name}</h4>
              <p className="mhn-connection-role">{member.roleTag}</p>

              {/* Team Pill Badge */}
              <div className="mhn-connection-team-pill">
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
                <span className="mhn-connection-team-name">{member.teamName}</span>
              </div>

              {/* Location Line */}
              <div className="mhn-connection-location-line">
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
              <button
                className="mhn-connection-btn-message"
                onClick={() => onMessageClick && onMessageClick(member)}
              >
                Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
