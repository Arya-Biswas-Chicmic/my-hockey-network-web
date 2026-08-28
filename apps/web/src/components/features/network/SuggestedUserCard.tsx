import { Button } from '@/components/common/Button';
import React, { useState } from 'react';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/hooks/use-auth';
import { ERROR_MESSAGES } from '@my-hockey-network/constants';
import { extractErrorMessage } from '@/utils/toast';
import { MapPin } from 'lucide-react';
import { FallbackImage } from '@/components/ui/fallback-image';

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
  avatarUrl = '/userPlaceholder.webp',
  roleTag,
  teamName,
  teamLogo = '/kcBlue.webp',
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
    } catch (err: unknown) {
      console.error('❌ [SuggestedUserCard] Follow failed:', err);
      setFollowing(prevFollowing);
      const errorMsg = extractErrorMessage(err, ERROR_MESSAGES.FAILED_FOLLOW);
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
        <FallbackImage
          src={avatarUrl}
          alt={name}
          fill
          className="mhn-suggested-avatar-img"
        />
      </div>

      {/* User Info */}
      <div className="mhn-suggested-info">
        <h4 className="mhn-suggested-name" title={name}>{name}</h4>
        <span className="mhn-suggested-role">{roleTag}</span>

        {/* Team Line */}
        {hasValidTeam && (
          <div className="mhn-suggested-team-line">
            <FallbackImage
              src={teamLogo}
              alt={teamName || 'Team logo'}
              width={16}
              height={17}
              fallbackSrc="/kcBlue.webp"
              className="mhn-suggested-team-logo"
            />
            <span className="mhn-suggested-team-name">{teamName}</span>
          </div>
        )}

        {/* Location Line */}
        {hasValidLocation && (
          <div className="mhn-suggested-location-line">
            <MapPin size={12} className="mhn-flex-shrink-0" aria-hidden="true" />
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
