import { Button } from '../../common/Button';
import React from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useQuery } from '../../../query';
import { getProfile } from '@my-hockey-network/core';
import { QueryKeys } from '@my-hockey-network/contracts';
import { resolveMediaUrl, resolveCoverUrl } from '../../../utils/mediaUtils';

interface ProfileSummaryCardProps {
  name?: string;
  role?: string;
  avatarUrl?: string;
  coverUrl?: string;
  location?: string;
  teamName?: string;
  teamLogo?: string;
  followers?: string;
  following?: string;
  onPostClick?: () => void;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  name,
  role,
  avatarUrl,
  coverUrl = '/cover.png',
  location = 'Austria, Europe',
  teamName = 'HC Bloemendaal',
  teamLogo = '/HC.png',
  followers = '-',
  following = '700',
  onPostClick
}) => {
  const { user, checkSupervisionPermission, assertSupervisionPermission } = useAuth();
  const canCreatePost = checkSupervisionPermission('create_posts');

  const profileId = user?.profile?.id || (user as any)?.profileId || (user as any)?.id;

  const { data: profileRes } = useQuery(
    profileId ? `${QueryKeys.USER_PROFILE}:${profileId}` : null,
    profileId ? () => getProfile(profileId) : null,
    { staleTime: 30 * 1000 }
  );

  const activeProfile = (profileRes as any)?.profile || (profileRes as any)?.data?.profile || user?.profile;

  const resolvedName = activeProfile?.displayName || user?.profile?.displayName || (user as any)?.displayName || name || 'Player';
  const resolvedRole = role || user?.primaryRole || activeProfile?.type || user?.profile?.type || 'PLAYER';
  const rawAvatar = activeProfile?.avatarUrl || user?.profile?.avatarUrl || avatarUrl;
  const resolvedAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');
  const rawCover =
    (activeProfile as any)?.coverImageUrl ||
    (activeProfile as any)?.coverUrl ||
    (activeProfile as any)?.coverImageKey ||
    (user?.profile as any)?.coverImageUrl ||
    (user?.profile as any)?.coverUrl ||
    (user?.profile as any)?.coverImageKey ||
    (user as any)?.coverImageUrl ||
    (user as any)?.coverUrl ||
    coverUrl;
  const resolvedCover = resolveCoverUrl(rawCover, '/cover.png');
  const resolvedFollowers = user?.counts?.followers !== undefined ? user.counts.followers : (followers ?? 0);
  const resolvedFollowing = user?.counts?.following !== undefined ? user.counts.following : (following ?? 0);

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
    'HC Bloemendaal';

  const effectiveTeamName = !isParentRole ? userTeam : undefined;

  return (
    <div className="mhn-profile-summary-stack">
      {/* Profile Card */}
      <div className="mhn-network-profile-card">
        {/* Cover Banner */}
        <div className="mhn-network-card-banner">
          <img 
            src={resolvedCover} 
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

        {/* User Identity Details */}
        <div className="mhn-network-user-info">
          <h3 className="mhn-network-user-name" title={resolvedName}>{resolvedName}</h3>
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

        {/* Followers & Following Stats Row */}
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

      {/* Post Action Button */}
      <Button
        onClick={() => assertSupervisionPermission('create_posts', onPostClick || (() => {}))}
        className="mhn-btn-post"
        title={!canCreatePost ? 'Parent did not give permission' : undefined}
      >
        {!canCreatePost && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
        Post
      </Button>
    </div>
  );
};

