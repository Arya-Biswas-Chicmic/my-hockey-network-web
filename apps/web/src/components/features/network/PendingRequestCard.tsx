import React, { useState } from 'react';
import { Spinner } from '../../common/Spinner';
import { useAuth } from '../../../hooks/use-auth';

export interface PendingRequestProps {
  id: string;
  name: string;
  avatarUrl?: string;
  roleTag: string;
  teamName?: string;
  teamLogo?: string;
  location?: string;
  onAccept?: (id: string) => Promise<void> | void;
  onIgnore?: (id: string) => Promise<void> | void;
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
  const { loadAuthMe, showToast } = useAuth();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'ignored'>('pending');
  const [isAcceptLoading, setIsAcceptLoading] = useState(false);
  const [isIgnoreLoading, setIsIgnoreLoading] = useState(false);

  const handleAccept = async () => {
    if (isAcceptLoading || isIgnoreLoading) return;
    setIsAcceptLoading(true);
    try {
      if (onAccept) await onAccept(id);
      setStatus('accepted');
      console.log('🚀 [PendingRequestCard] Triggering silent loadAuthMe after accept...');
      await loadAuthMe(true);
    } catch (err: any) {
      console.error('Accept error:', err);
      showToast(err?.message || 'Failed to accept request.', 'error');
    } finally {
      setIsAcceptLoading(false);
    }
  };

  const handleIgnore = async () => {
    if (isAcceptLoading || isIgnoreLoading) return;
    setIsIgnoreLoading(true);
    try {
      if (onIgnore) await onIgnore(id);
      setStatus('ignored');
      console.log('🚀 [PendingRequestCard] Triggering silent loadAuthMe after ignore...');
      await loadAuthMe(true);
    } catch (err: any) {
      console.error('Ignore error:', err);
      showToast(err?.message || 'Failed to decline request.', 'error');
    } finally {
      setIsIgnoreLoading(false);
    }
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
          disabled={isIgnoreLoading || isAcceptLoading}
          className="mhn-btn-request-ignore"
        >
          {isIgnoreLoading ? <Spinner size="sm" color="#64748B" /> : 'Ignore'}
        </button>
        <button 
          onClick={handleAccept} 
          disabled={isIgnoreLoading || isAcceptLoading}
          className="mhn-btn-request-accept"
        >
          {isAcceptLoading ? <Spinner size="sm" color="#FFFFFF" /> : 'Accept'}
        </button>
      </div>
    </div>
  );
};

