import { Button } from '../../common/Button';
import { Input } from '../../common/FormControls';
import React, { useState } from 'react';
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

  const filteredMembers = sampleConnections.filter(
    (item) =>
      item.type === activeTab &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.roleTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="mhn-connections-view-container" style={{ width: '100%' }}>
      {/* 1. Page Header Title matching Figma */}
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', marginTop: 0 }}>
        Connections
      </h2>

      {/* 2. Full Width Search Input Bar */}
      <div
        className="mhn-connections-search-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          marginBottom: '20px',
        }}
      >
        <svg
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
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
          style={{
            width: '100%',
            height: '44px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            paddingLeft: '42px',
            paddingRight: '16px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: '#FFFFFF',
          }}
        />
      </div>

      {/* 3. Followers / Following Sub-Tabs matching Figma Screenshot */}
      <div
        className="mhn-connections-tabs-row"
        style={{
          display: 'flex',
          width: '100%',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '24px',
          gap: '0',
        }}
      >
        <Button
          onClick={() => setActiveTab('followers')}
          style={{
            flex: 1,
            padding: '14px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'followers' ? '3px solid #18181B' : '3px solid transparent',
            marginBottom: '-1px',
            color: activeTab === 'followers' ? '#18181B' : '#71717A',
            fontSize: '15px',
            fontWeight: activeTab === 'followers' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            textAlign: 'center',
          }}
        >
          Followers
        </Button>

        <Button
          onClick={() => setActiveTab('following')}
          style={{
            flex: 1,
            padding: '14px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'following' ? '3px solid #18181B' : '3px solid transparent',
            marginBottom: '-1px',
            color: activeTab === 'following' ? '#18181B' : '#71717A',
            fontSize: '15px',
            fontWeight: activeTab === 'following' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            textAlign: 'center',
          }}
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
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            width: '100%',
          }}
        >
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {/* Avatar Circle with blue ring */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  padding: '3px',
                  border: '2px solid #1860C3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                  }}
                />
              </div>

              {/* User Name */}
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>
                {member.name}
              </h4>

              {/* Role Tag */}
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 8px 0', fontWeight: 500 }}>
                {member.roleTag}
              </p>

              {/* Team Pill Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1860C3',
                  marginBottom: '6px',
                }}
              >
                {member.teamLogo && (
                  <img
                    src={member.teamLogo}
                    alt={member.teamName}
                    style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/HC.png';
                    }}
                  />
                )}
                <span>{member.teamName}</span>
              </div>

              {/* Location Line */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#64748B',
                  marginBottom: '16px',
                }}
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
                style={{
                  width: '100%',
                  height: '38px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #1860C3',
                  borderRadius: '8px',
                  color: '#1860C3',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: 'auto',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                }}
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
