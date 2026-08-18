import React, { useState } from 'react';

export interface PendingRequestProps {
  id: string;
  name: string;
  avatarUrl?: string;
  roleTag: string;
  teamName?: string;
  teamLogo?: string;
  location?: string;
  onAccept?: (id: string) => void;
  onIgnore?: (id: string) => void;
}

export const PendingRequestCard: React.FC<PendingRequestProps> = ({
  id,
  name = '-',
  avatarUrl = '/userPlaceholder.png',
  roleTag = '-',
  teamName = '-',
  teamLogo = '/kcBlue.png',
  location = '-',
  onAccept,
  onIgnore
}) => {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'ignored'>('pending');

  const handleAccept = () => {
    setStatus('accepted');
    if (onAccept) onAccept(id);
  };

  const handleIgnore = () => {
    setStatus('ignored');
    if (onIgnore) onIgnore(id);
  };

  if (status === 'accepted') {
    return (
      <div className="mhn-pending-request-card mhn-request-resolved">
        <span className="mhn-resolved-text">Request accepted</span>
      </div>
    );
  }

  if (status === 'ignored') {
    return (
      <div className="mhn-pending-request-card mhn-request-resolved">
        <span className="mhn-resolved-text">Request ignored</span>
      </div>
    );
  }

  return (
    <div className="mhn-pending-request-card">
      {/* Avatar Circle */}
      <div className="mhn-request-avatar-box">
        <img 
          src={avatarUrl} 
          alt={name} 
          className="mhn-request-avatar-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/userPlaceholder.png';
          }}
        />
      </div>

      {/* User Info */}
      <div className="mhn-request-info">
        <h4 className="mhn-request-name">{name}</h4>
        <span className="mhn-request-role">{roleTag}</span>

        {/* Team Badge Pill */}
        {teamName && (
          <div className="mhn-request-team-line">
            <img 
              src={teamLogo} 
              alt={teamName} 
              className="mhn-request-team-logo"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/kcBlue.png';
              }}
            />
            <span className="mhn-request-team-name">{teamName}</span>
          </div>
        )}

        {/* Location Line */}
        {location && (
          <div className="mhn-request-location-line">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="mhn-request-location-text">{location}</span>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="mhn-request-actions-row">
        <button 
          onClick={handleIgnore} 
          className="mhn-btn-request-ignore"
        >
          Ignore
        </button>
        <button 
          onClick={handleAccept} 
          className="mhn-btn-request-accept"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

