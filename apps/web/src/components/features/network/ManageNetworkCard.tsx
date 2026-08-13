import React from 'react';

interface ManageNetworkCardProps {
  name?: string;
  role?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  teamName?: string;
  teamLogo?: string;
  followersCount?: string | number;
  followingCount?: string | number;
  onMenuItemClick?: (item: string) => void;
}

export const ManageNetworkCard: React.FC<ManageNetworkCardProps> = ({
  name = 'Jack Ruffle',
  role = 'Center • #97',
  avatarUrl = '/jack.png',
  bannerUrl = '/cover.png',
  location = 'Austria, Europe',
  teamName = 'HC Bregenzerwald',
  teamLogo = '/HC.png',
  followersCount = '1M',
  followingCount = '700',
  onMenuItemClick
}) => {
  return (
    <div className="mhn-manage-network-stack">
      {/* Top Profile Card with Stats */}
      <div className="mhn-network-profile-card">
        {/* Cover Banner */}
        <div className="mhn-network-card-banner">
          <img 
            src={bannerUrl} 
            alt="Cover" 
            className="mhn-network-banner-img"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }} 
          />
        </div>

        {/* Avatar Circle */}
        <div className="mhn-network-avatar-wrapper">
          <div className="mhn-network-avatar-circle">
            <img 
              src={avatarUrl} 
              alt={name} 
              className="mhn-network-avatar-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/userPlaceholder.png';
              }} 
            />
          </div>
        </div>

        {/* User Info */}
        <div className="mhn-network-user-info">
          <h3 className="mhn-network-user-name">{name}</h3>
          <p className="mhn-network-user-role">{role}</p>

          {/* Location Line */}
          {location && (
            <div className="mhn-profile-location-line">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span className='location2'>{location}</span>
            </div>
          )}

          {/* Team Badge Pill */}
          {teamName && (
            <div className="mhn-profile-team-badge">
              <img 
                src={teamLogo} 
                alt={teamName} 
                className="mhn-profile-team-logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/HC.png';
                }}
              />
              <span className="mhn-profile-team-name">{teamName}</span>
            </div>
          )}
        </div>

        {/* Followers / Following Stats Row */}
        <div className="mhn-network-stats-row">
          <div className="mhn-network-stat-col">
            <span className="mhn-network-stat-number">{followersCount}</span>
            <span className="mhn-network-stat-label">Followers</span>
          </div>
          <div className="mhn-network-stat-divider" />
          <div className="mhn-network-stat-col">
            <span className="mhn-network-stat-number">{followingCount}</span>
            <span className="mhn-network-stat-label">Following</span>
          </div>
        </div>
      </div>

      {/* Manage My Network List Card */}
      <div className="mhn-manage-menu-card">
        <h4 className="mhn-manage-menu-title">Manage my network</h4>

        <div className="mhn-manage-menu-list">
          {/* Connectors */}
          <button 
            onClick={() => onMenuItemClick && onMenuItemClick('connectors')}
            className="mhn-manage-menu-item"
          >
            <div className="mhn-manage-icon-box">
              <img src="/connections.png" alt="Connections" className='small-icon'/>
            </div>
            <span className="mhn-manage-menu-text">Connections</span>
          </button>

          {/* Groups */}
          <button 
            onClick={() => onMenuItemClick && onMenuItemClick('groups')}
            className="mhn-manage-menu-item"
          >
              <div className="mhn-manage-icon-box">
              <img src="/groups.png" alt="Connections" className='small-icon'/>
            </div>
            <span className="mhn-manage-menu-text">Groups</span>
            <span className="mhn-manage-menu-badge">1</span>
          </button>

          {/* Events */}
          <button 
            onClick={() => onMenuItemClick && onMenuItemClick('events')}
            className="mhn-manage-menu-item"
          >
             <div className="mhn-manage-icon-box">
              <img src="/events.png" alt="Connections" className='small-icon'/>
            </div>
            <span className="mhn-manage-menu-text">Events</span>
            <span className="mhn-manage-menu-badge">1</span>
          </button>
        </div>
      </div>
    </div>
  );
};

