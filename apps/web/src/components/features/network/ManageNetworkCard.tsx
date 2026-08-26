import { Button } from '@/components/common/Button';
import React from 'react';
import { useProfileCardData } from '@/hooks/use-profile-card-data';
import { MapPin } from 'lucide-react';

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
  name,
  role,
  avatarUrl,
  bannerUrl = '/cover.png',
  location = 'Austria, Europe',
  teamName = 'HC Bregenzerwald',
  teamLogo = '/HC.png',
  followersCount,
  followingCount,
  onMenuItemClick
}) => {
  const profile = useProfileCardData({
    name,
    role,
    avatarUrl,
    coverUrl: bannerUrl,
    location,
    teamName,
    followers: followersCount,
    following: followingCount,
  });
  const { name: resolvedName, role: resolvedRole, avatar: resolvedAvatar, cover: resolvedBanner,
    location: resolvedLocation, teamName: effectiveTeamName, followers: resolvedFollowers,
    following: resolvedFollowing } = profile;

  return (
    <div className="mhn-manage-network-stack">
      {/* Top Profile Card with Stats */}
      <div className="mhn-network-profile-card">
        {/* Cover Banner */}
        <div className="mhn-network-card-banner">
          <img 
            src={resolvedBanner} 
            alt="Cover" 
            className="mhn-network-banner-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/cover.png';
            }} 
          />
        </div>

        {/* Avatar Circle */}
        <div className="mhn-network-avatar-wrapper">
          <div className="mhn-network-avatar-circle">
            <img 
              src={resolvedAvatar} 
              alt={resolvedName} 
              className="mhn-network-avatar-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/userPlaceholder.png';
              }} 
            />
          </div>
        </div>

        {/* User Info */}
        <div className="mhn-network-user-info">
          <h3 className="mhn-network-user-name">{resolvedName}</h3>
          <p className="mhn-network-user-role">{resolvedRole}</p>

          {/* Location Line */}
          {resolvedLocation && (
            <div className="mhn-profile-location-line mhn-btn-loading-flex">
              <MapPin size={12} color="#64748B" className="mhn-flex-shrink-0" />
              <span>{resolvedLocation}</span>
            </div>
          )}

          {/* Team Badge Pill (Only shown for Player or Coach if a team was added, never for Parent) */}
          {effectiveTeamName && (
            <div className="mhn-profile-team-badge">
              <img 
                src={teamLogo} 
                alt={effectiveTeamName} 
                className="mhn-profile-team-logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/HC.png';
                }}
              />
              <span className="mhn-profile-team-name">{effectiveTeamName}</span>
            </div>
          )}
        </div>

        {/* Followers / Following Stats Row */}
        <div className="mhn-network-stats-row">
          <div className="mhn-network-stat-col">
            <span className="mhn-network-stat-number">{resolvedFollowers}</span>
            <span className="mhn-network-stat-label">Followers</span>
          </div>
          <div className="mhn-network-stat-divider" />
          <div className="mhn-network-stat-col">
            <span className="mhn-network-stat-number">{resolvedFollowing}</span>
            <span className="mhn-network-stat-label">Following</span>
          </div>
        </div>
      </div>

      {/* Manage My Network List Card */}
      <div className="mhn-manage-menu-card">
        <h4 className="mhn-manage-menu-title">Manage my network</h4>

        <div className="mhn-manage-menu-list">
          {/* Connectors */}
          <Button
            onClick={() => onMenuItemClick && onMenuItemClick('connectors')}
            className="mhn-manage-menu-item"
          >
            <div className="mhn-manage-icon-box">
              <img src="/connections.png" alt="Connections" className='small-icon'/>
            </div>
            <span className="mhn-manage-menu-text">Connections</span>
          </Button>

          {/* Groups */}
          <Button
            onClick={() => onMenuItemClick && onMenuItemClick('groups')}
            className="mhn-manage-menu-item"
          >
              <div className="mhn-manage-icon-box">
              <img src="/groups.png" alt="Connections" className='small-icon'/>
            </div>
            <span className="mhn-manage-menu-text">Groups</span>
            <span className="mhn-manage-menu-badge">1</span>
          </Button>

          {/* Events */}
          <Button
            onClick={() => onMenuItemClick && onMenuItemClick('events')}
            className="mhn-manage-menu-item"
          >
             <div className="mhn-manage-icon-box">
              <img src="/events.png" alt="Connections" className='small-icon'/>
            </div>
            <span className="mhn-manage-menu-text">Events</span>
            <span className="mhn-manage-menu-badge">1</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
