import { Button } from '../../common/Button';
import React from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useQuery } from '../../../query';
import { getProfile } from '@my-hockey-network/core';
import { QueryKeys } from '@my-hockey-network/contracts';
import { resolveMediaUrl, resolveCoverUrl } from '../../../utils/mediaUtils';

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
  const { user } = useAuth();

  const profileId = user?.profile?.id || (user as any)?.profileId || (user as any)?.id;

  const { data: profileRes } = useQuery(
    profileId ? `${QueryKeys.USER_PROFILE}:${profileId}` : null,
    profileId ? () => getProfile(profileId) : null,
    { staleTime: 30 * 1000 }
  );

  const activeProfile = (profileRes as any)?.profile || (profileRes as any)?.data?.profile || user?.profile;

  const resolvedName = activeProfile?.displayName || user?.profile?.displayName || (user as any)?.displayName || name || 'Player';
  const resolvedRole = user?.primaryRole || activeProfile?.type || user?.profile?.type || role || 'PLAYER';
  const rawAvatar = activeProfile?.avatarUrl || user?.profile?.avatarUrl || (user as any)?.avatarUrl || avatarUrl;
  const resolvedAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');
  const rawBanner =
    (activeProfile as any)?.coverImageUrl ||
    (activeProfile as any)?.coverUrl ||
    (activeProfile as any)?.coverImageKey ||
    (user?.profile as any)?.coverImageUrl ||
    (user?.profile as any)?.coverUrl ||
    (user?.profile as any)?.coverImageKey ||
    (user as any)?.coverImageUrl ||
    (user as any)?.coverUrl ||
    bannerUrl;
  const resolvedBanner = resolveCoverUrl(rawBanner, '/cover.png');
  const resolvedFollowers = user?.counts?.followers !== undefined ? user.counts.followers : (followersCount ?? 0);
  const resolvedFollowing = user?.counts?.following !== undefined ? user.counts.following : (followingCount ?? 0);

  const resolvedLocation = activeProfile?.city || activeProfile?.location || user?.profile?.city || (location !== 'Austria, Europe' ? location : undefined) || '-';

  const isParentRole = String(resolvedRole).toUpperCase() === 'PARENT';
  const careerList =
    (activeProfile as any)?.careerEntries ||
    (activeProfile as any)?.career ||
    (user?.profile as any)?.careerEntries ||
    (user?.profile as any)?.career ||
    (user as any)?.careerEntries ||
    (user as any)?.career;

  const firstCareerTeam = Array.isArray(careerList) && careerList.length > 0 ? careerList[0]?.teamName : undefined;

  const userTeam =
    firstCareerTeam ||
    activeProfile?.teamName ||
    (activeProfile as any)?.team ||
    (activeProfile as any)?.academyName ||
    (activeProfile as any)?.currentTeam ||
    (user?.profile as any)?.teamName ||
    (user?.profile as any)?.team ||
    (user?.profile as any)?.academyName ||
    (user?.profile as any)?.currentTeam ||
    (user as any)?.teamName ||
    (user as any)?.team ||
    teamName ||
    'HC Bregenzerwald';

  const effectiveTeamName = !isParentRole ? userTeam : undefined;

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
            <div className="mhn-profile-location-line" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
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
