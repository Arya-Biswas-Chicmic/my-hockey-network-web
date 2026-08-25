import { Button } from '../../common/Button';
import React, { useState } from 'react';
import { Spinner } from '../../common/Spinner';
import { useAuth } from '../../../hooks/use-auth';
import { ERROR_MESSAGES } from '@my-hockey-network/constants';

export interface SuggestedUserProps {
  id: string;
  name: string;
  avatarUrl?: string;
  roleTag: string;
  teamName: string;
  teamLogo?: string;
  location: string;
  isFollowing?: boolean;
  onFollow?: (id: string) => Promise<void> | void;
}

export const SuggestedUserCard: React.FC<SuggestedUserProps> = ({
  id,
  name,
  avatarUrl = '/userPlaceholder.png',
  roleTag,
  teamName,
  teamLogo = '/kcBlue.png',
  location,
  isFollowing: initialFollowing = false,
  onFollow,
}) => {
  const { loadAuthMe, showToast } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const prevFollowing = following;
    const targetFollowing = !following;

    try {
      if (onFollow) {
        await onFollow(id);
      }
      setFollowing(targetFollowing);
      await loadAuthMe(true);
    } catch (err: any) {
      console.error('❌ [SuggestedUserCard] Follow failed:', err);
      setFollowing(prevFollowing);
      const errorMsg = err?.message || ERROR_MESSAGES.FAILED_FOLLOW;
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };


  const hasValidTeam = Boolean(teamName && teamName.trim() !== '' && teamName.trim() !== '-');
  const hasValidLocation = Boolean(location && location.trim() !== '' && location.trim() !== '-');

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
        <h4 className="mhn-suggested-name" title={name}>{name}</h4>
        <span className="mhn-suggested-role">{roleTag}</span>

        {/* Team Line */}
        {hasValidTeam && (
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
        )}

        {/* Location Line */}
        {hasValidLocation && (
          <div className="mhn-suggested-location-line">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="location-text">{location}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={toggleFollow}
        disabled={isLoading}
        className={`mhn-btn-suggested-follow ${following ? 'mhn-btn-suggested-following' : ''}`}
      >
        {isLoading ? (
          <Spinner size="sm" color={following ? "#0F172A" : "#FFFFFF"} />
        ) : (
          following ? 'Following' : 'Follow'
        )}
      </Button>
    </div>
  );
};
