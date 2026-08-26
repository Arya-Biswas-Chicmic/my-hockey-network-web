import { Button } from '@/components/common/Button';
import React, { useState } from 'react';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/hooks/use-auth';
import { ERROR_MESSAGES } from '@my-hockey-network/constants';
import { extractErrorMessage } from '@/utils/toast';
import { MapPin } from 'lucide-react';

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
  name = 'Athlete',
  avatarUrl = '/userPlaceholder.png',
  roleTag = 'PLAYER',
  teamName,
  teamLogo = '/kcBlue.png',
  location,
  onAccept,
  onIgnore
}) => {
  const { loadAuthMe, showToast } = useAuth();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'ignored'>('pending');
  const [isAcceptLoading, setIsAcceptLoading] = useState(false);
  const [isIgnoreLoading, setIsIgnoreLoading] = useState(false);

  const hasValidTeam = Boolean(teamName && teamName.trim() !== '' && teamName.trim() !== '-');
  const hasValidLocation = Boolean(location && location.trim() !== '' && location.trim() !== '-');

  const handleAccept = async () => {
    if (isAcceptLoading || isIgnoreLoading) return;
    setIsAcceptLoading(true);
    try {
      if (onAccept) await onAccept(id);
      setStatus('accepted');
      await loadAuthMe(true);
    } catch (err: unknown) {
      console.error('Accept error:', err);
      showToast(extractErrorMessage(err, ERROR_MESSAGES.FAILED_ACCEPT_REQUEST), 'error');
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
      await loadAuthMe(true);
    } catch (err: unknown) {
      console.error('Ignore error:', err);
      showToast(extractErrorMessage(err, ERROR_MESSAGES.FAILED_DECLINE_REQUEST), 'error');
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
        <h4 className="mhn-request-name" title={name}>{name}</h4>
        <span className="mhn-request-role">{roleTag}</span>

        {/* Team Badge Pill */}
        {hasValidTeam && (
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
        {hasValidLocation && (
          <div className="mhn-request-location-line">
            <MapPin size={12} className="mhn-flex-shrink-0" aria-hidden="true" />
            <span className="mhn-request-location-text">{location}</span>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="mhn-request-actions-row">
        <Button
          onClick={handleIgnore} 
          disabled={isIgnoreLoading || isAcceptLoading}
          className="mhn-btn-request-ignore"
        >
          {isIgnoreLoading ? <Spinner size="sm" color="#64748B" /> : 'Ignore'}
        </Button>
        <Button
          onClick={handleAccept} 
          disabled={isIgnoreLoading || isAcceptLoading}
          className="mhn-btn-request-accept"
        >
          {isAcceptLoading ? <Spinner size="sm" color="#FFFFFF" /> : 'Accept'}
        </Button>
      </div>
    </div>
  );
};
