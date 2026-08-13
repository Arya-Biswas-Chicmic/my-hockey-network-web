import React, { useState } from 'react';

export interface SuggestedUserProps {
  id: string;
  name: string;
  avatarUrl?: string;
  roleTag: string;
  teamName: string;
  teamLogo?: string;
  location: string;
  isFollowing?: boolean;
}

export const SuggestedUserCard: React.FC<SuggestedUserProps> = ({
  name,
  avatarUrl = '/userPlaceholder.png',
  roleTag,
  teamName,
  teamLogo = '/kcBlue.png',
  location,
  isFollowing: initialFollowing = false
}) => {
  const [following, setFollowing] = useState(initialFollowing);

  const toggleFollow = () => {
    setFollowing(!following);
  };

  return (
    <div className="mhn-suggested-card">
      {/* Avatar Circle */}
      <div className="mhn-suggested-avatar-box">
        <img 
          src={avatarUrl} 
          alt={name} 
          className="mhn-suggested-avatar-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/userPlaceholder.png';
          }}
        />
      </div>

      {/* User Info */}
      <div className="mhn-suggested-info">
        <h4 className="mhn-suggested-name">{name}</h4>
        <span className="mhn-suggested-role">{roleTag}</span>

        {/* Team Line */}
        <div className="mhn-suggested-team-line">
          <img 
            src={teamLogo} 
            alt={teamName} 
            className="mhn-suggested-team-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/kcBlue.png';
            }}
          />
          <span className="mhn-suggested-team-name">{teamName}</span>
        </div>

        {/* Location Line */}
        <div className="mhn-suggested-location-line">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span className='location-text'>{location}</span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={toggleFollow}
        className={`mhn-btn-suggested-follow ${following ? 'mhn-btn-suggested-following' : ''}`}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};
