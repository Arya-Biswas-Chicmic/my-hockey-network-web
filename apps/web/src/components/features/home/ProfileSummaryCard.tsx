import React from 'react';

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
  name = 'Alexander Ovechkin',
  role = 'LW • #8',
  avatarUrl = '/ovechkin.png',
  coverUrl = '/cover.png',
  location = 'Austria, Europe',
  teamName = 'HC Bloemendaal',
  teamLogo = '/HC.png',
  followers = '1M',
  following = '700',
  onPostClick
}) => {
  return (
    <div className="mhn-profile-summary-stack">
      {/* Profile Card */}
      <div className="mhn-profile-summary-card">
        {/* Card Header Banner Background */}
        <div 
          className="mhn-profile-card-banner"
          style={{
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Avatar Circle */}
        <div className="mhn-profile-avatar-wrapper">
          <div className="mhn-profile-avatar-circle">
            <img 
              src={avatarUrl} 
              alt={name} 
              className="mhn-profile-avatar-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/userPlaceholder.png';
              }} 
            />
          </div>
        </div>

        {/* User Info */}
        <div className="mhn-profile-info">
          <h3 className="mhn-profile-name">{name}</h3>
          <p className="mhn-profile-role">{role}</p>

          {/* Location Line */}
          {location && (
            <div className="mhn-profile-location-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{location}</span>
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
              <span className="mhn-stat-num">{followers}</span>
              <span className="mhn-stat-label">Followers</span>
            </div>
            <div className="mhn-profile-stat-divider" />
            <div className="mhn-profile-stat-col">
              <span className="mhn-stat-num">{following}</span>
              <span className="mhn-stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post Action Button */}
      <button onClick={onPostClick} className="mhn-btn-post">
        Post
      </button>
    </div>
  );
};

