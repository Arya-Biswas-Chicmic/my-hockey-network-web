import { Button } from '../../common/Button';
import React from 'react';
import { useAuth } from '../../../hooks/use-auth';
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
  const { user } = useAuth();

  const resolvedName = user?.profile?.displayName || (user as any)?.displayName || name || 'Player';
  const resolvedRole = role || user?.primaryRole || user?.profile?.type || 'PLAYER';
  const rawAvatar = user?.profile?.avatarUrl || avatarUrl;
  const resolvedAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');
  const rawCover =
    (user?.profile as any)?.coverImageUrl ||
    (user?.profile as any)?.coverUrl ||
    (user?.profile as any)?.coverImageKey ||
    (user as any)?.coverImageUrl ||
    (user as any)?.coverUrl ||
    coverUrl;
  const resolvedCover = resolveCoverUrl(rawCover, '/cover.png');
  const resolvedFollowers = user?.counts?.followers !== undefined ? user.counts.followers : (followers ?? 0);
  const resolvedFollowing = user?.counts?.following !== undefined ? user.counts.following : (following ?? 0);

  const resolvedLocation = user?.profile?.city || (location !== 'Austria, Europe' ? location : undefined) || '-';

  const { checkSupervisionPermission, assertSupervisionPermission } = useAuth();
  const canCreatePost = checkSupervisionPermission('create_posts');

  return (
    <div className="mhn-profile-summary-stack">
      {/* Profile Card */}
      <div className="mhn-profile-summary-card">
        {/* Card Header Banner Background */}
        <div 
          className="mhn-profile-card-banner"
          style={{ backgroundImage: `url(${resolvedCover})` }}
        />

        {/* Profile Avatar Outer Circle */}
        <div className="mhn-profile-avatar-wrapper">
          <div className="mhn-profile-avatar-circle">
            <img 
              src={resolvedAvatar} 
              alt={resolvedName} 
              className="mhn-profile-avatar-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/userPlaceholder.png';
              }} 
            />
          </div>
        </div>

        {/* User Identity Details */}
        <div className="mhn-profile-info">
          <h3 className="mhn-profile-name">{resolvedName}</h3>
          <p className="mhn-profile-role">{resolvedRole}</p>

          {/* Location Line */}
          {resolvedLocation && (
            <div className="mhn-profile-location-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{resolvedLocation}</span>
            </div>
          )}

          {/* Team Pill Badge */}
          {teamName && (
            <div className="mhn-profile-team-pill">
              {teamLogo && <img src={teamLogo} alt={teamName} className="mhn-team-pill-logo" />}
              <span className="mhn-team-pill-name">{teamName}</span>
            </div>
          )}

          {/* Followers & Following Stats Row */}
          <div className="mhn-profile-stats-divider-row">
            <div className="mhn-profile-stat-col">
              <span className="mhn-stat-num">{resolvedFollowers}</span>
              <span className="mhn-stat-label">Followers</span>
            </div>
            <div className="mhn-profile-stat-divider" />
            <div className="mhn-profile-stat-col">
              <span className="mhn-stat-num">{resolvedFollowing}</span>
              <span className="mhn-stat-label">Following</span>
            </div>
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

