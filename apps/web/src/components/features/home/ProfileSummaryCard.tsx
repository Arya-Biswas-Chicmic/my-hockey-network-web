import React from 'react';

interface ProfileSummaryCardProps {
  name?: string;
  role?: string;
  avatarUrl?: string;
  onPostClick?: () => void;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  name = 'Jack Ruffle',
  role = 'Player',
  avatarUrl = '/userPlaceholder.png',
  onPostClick
}) => {
  return (
    <div className="mhn-profile-summary-stack">
      {/* Profile Card */}
      <div className="mhn-profile-summary-card">
        {/* Card Header Banner Background */}
        <div className="mhn-profile-card-banner" />
        
        {/* Avatar Circle */}
        <div className="mhn-profile-avatar-wrapper">
          <div className="mhn-profile-avatar-circle">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="mhn-profile-avatar-img" />
            ) : (
              <div className="mhn-profile-avatar-placeholder">
                <img src="/userPlaceholder.png" alt={name} className="mhn-profile-avatar-img" />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mhn-profile-info">
          <h3 className="mhn-profile-name">{name}</h3>
          <p className="mhn-profile-role">{role}</p>
        </div>
      </div>

      {/* Post Action Button */}
      <button onClick={onPostClick} className="mhn-btn-post">
        Post
      </button>
    </div>
  );
};
