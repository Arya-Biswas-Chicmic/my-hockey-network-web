import { Button } from '@/components/common/Button';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useProfileCardData } from '@/hooks/use-profile-card-data';
import { LockKeyhole, MapPin } from 'lucide-react';

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
  const profile = useProfileCardData({ name, role, avatarUrl, coverUrl, location, teamName, followers, following });
  const { name: resolvedName, role: resolvedRole, avatar: resolvedAvatar, cover: resolvedCover,
    location: resolvedLocation, teamName: effectiveTeamName, followers: resolvedFollowers,
    following: resolvedFollowing } = profile;

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
          <LockKeyhole size={14} strokeWidth={2.5} className="mhn-mr-6" />
        )}
        Post
      </Button>
    </div>
  );
};
