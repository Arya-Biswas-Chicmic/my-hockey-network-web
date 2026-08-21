import { Button } from '../../common/Button';
import { Input } from '../../common/FormControls';
import React, { useState } from 'react';

export interface GroupItem {
  id: string;
  name: string;
  membersCount: string;
  bannerImage: string;
  isMember?: boolean;
}

interface GroupsViewProps {
  onViewGroup?: (groupId: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({ onViewGroup }) => {
  const [activeTab, setActiveTab] = useState<'your-groups' | 'discover'>('your-groups');
  const [searchQuery, setSearchQuery] = useState('');

  const yourGroups: GroupItem[] = [
    {
      id: 'g1',
      name: 'San Jose Sharks',
      membersCount: '1M members',
      bannerImage: '/event1.png',
      isMember: true,
    }
  ];

  const discoverGroups: GroupItem[] = [
    {
      id: 'g2',
      name: 'Boston Bruins',
      membersCount: '850K members',
      bannerImage: '/mhnStars.png',
      isMember: false,
    },
    {
      id: 'g3',
      name: 'Edmonton Oilers',
      membersCount: '620K members',
      bannerImage: '/playHockey.png',
      isMember: false,
    },
    {
      id: 'g4',
      name: 'Toronto Maple Leafs',
      membersCount: '1.2M members',
      bannerImage: '/cover.png',
      isMember: false,
    }
  ];

  const currentList = activeTab === 'your-groups' ? yourGroups : discoverGroups;
  const filteredGroups = currentList.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mhn-groups-view-container">
      {/* Title Header Box */}
      <div className="mhn-groups-header-box">
        <h2 className="mhn-groups-main-title">Groups</h2>
        <p className="mhn-groups-main-subtitle">
          Connect with players, coaches, clubs & scouts to take your game further.
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="mhn-groups-search-box">
        <div className="mhn-groups-search-input-wrapper">
          <svg className="mhn-groups-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="mhn-groups-search-input"
          />
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="mhn-groups-tabs-bar">
        <Button
          onClick={() => setActiveTab('your-groups')}
          className={`mhn-groups-tab-btn ${activeTab === 'your-groups' ? 'active' : ''}`}
        >
          <span>Your Groups</span>
          {activeTab === 'your-groups' && <div className="mhn-groups-tab-line" />}
        </Button>
        <Button
          onClick={() => setActiveTab('discover')}
          className={`mhn-groups-tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
        >
          <span>Discover</span>
          {activeTab === 'discover' && <div className="mhn-groups-tab-line" />}
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="mhn-groups-cards-grid">
        {filteredGroups.map((group) => (
          <div key={group.id} className="mhn-group-card">
            {/* Banner Image with 3-dots */}
            <div className="mhn-group-card-banner">
              <img src={group.bannerImage} alt={group.name} className="mhn-group-banner-img" />
              <Button className="mhn-group-dots-btn" aria-label="More options">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </Button>
            </div>

            {/* Group Content */}
            <div className="mhn-group-card-body">
              <h3 className="mhn-group-title">{group.name}</h3>
              <p className="mhn-group-members">{group.membersCount}</p>

              <Button
                className="mhn-btn-view-group"
                onClick={() => onViewGroup && onViewGroup(group.id)}
              >
                Join Group
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
