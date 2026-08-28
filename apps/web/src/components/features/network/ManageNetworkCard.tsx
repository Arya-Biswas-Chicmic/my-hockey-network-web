import { Button } from '@/components/common/Button';
import Image from 'next/image';
import { FallbackImage } from '@/components/ui/fallback-image';
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
  bannerUrl = '/cover.webp',
  location,
  teamName,
  teamLogo = '/userPlaceholder.webp',
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
          <FallbackImage
            src={resolvedBanner}
            alt="Cover"
            fill
            fallbackSrc="/cover.webp"
            className="mhn-network-banner-img"
          />
        </div>

        {/* Avatar Circle */}
        <div className="mhn-network-avatar-wrapper">
          <div className="mhn-network-avatar-circle">
            <FallbackImage
              src={resolvedAvatar}
              alt={resolvedName}
              fill
              className="mhn-network-avatar-img"
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
              <FallbackImage
                src={teamLogo}
                alt={effectiveTeamName}
                width={21}
                height={25}
                fallbackSrc="/HC.webp"
                className="mhn-profile-team-logo"
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
              <Image src="/connections.webp" alt="Connections" width={26} height={26} className='small-icon'/>
            </div>
            <span className="mhn-manage-menu-text">Connections</span>
          </Button>

          {/* Groups */}
          <Button
            onClick={() => onMenuItemClick && onMenuItemClick('groups')}
            className="mhn-manage-menu-item"
          >
              <div className="mhn-manage-icon-box">
              <Image src="/groups.webp" alt="Groups" width={26} height={26} className='small-icon'/>
            </div>
            <span className="mhn-manage-menu-text">Groups</span>
          </Button>

          {/* Events */}
          <Button
            onClick={() => onMenuItemClick && onMenuItemClick('events')}
            className="mhn-manage-menu-item"
          >
             <div className="mhn-manage-icon-box">
              <Image src="/events.webp" alt="Events" width={26} height={26} className='small-icon'/>
            </div>
            <span className="mhn-manage-menu-text">Events</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
