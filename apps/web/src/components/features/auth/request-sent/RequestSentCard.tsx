import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import Image from 'next/image';
import React, { useState } from 'react';
import { REQUEST_SENT_STRINGS } from '@my-hockey-network/shared';
import { RequestSentBadgeIcon, HockeyTournamentIcon, CommunityBoardIcon } from '@/components/features/auth/request-sent/RequestSentIcons';
import { PublicFeatureCard } from '@/components/features/auth/request-sent/PublicFeatureCard';
import { showInfoToast } from '@/utils/toast';

interface RequestSentCardProps {
  onContinue?: () => void;
  onSelectTournament?: () => void;
  onSelectCommunity?: () => void;
  loading?: boolean;
}

export const RequestSentCard: React.FC<RequestSentCardProps> = ({
  onContinue,
  onSelectTournament,
  onSelectCommunity,
  loading: externalLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading || internalLoading;

  const handleContinueClick = async () => {
    if (isLoading) return;
    setInternalLoading(true);
    try {
      if (onContinue) {
        await onContinue();
      } else {
        showInfoToast('Continue is unavailable until navigation is configured.');
      }
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div className="request-sent-modal">
      <div className="request-sent-content">
        {/* Top Status Visualization Icon */}
        <div className="request-sent-badge-wrapper">
          <Image
            src="/StatusVisualization.png"
            alt="Status Visualization"
            width={128}
            height={128}
            className="request-sent-status-img"
          />
        </div>

        {/* Hero Typography */}
        <div className="request-sent-header">
          <h1 className="request-sent-title">
            {REQUEST_SENT_STRINGS.title}
          </h1>
          <p className="request-sent-subtitle">
            {REQUEST_SENT_STRINGS.subtitle}
          </p>
        </div>

        {/* Continue Button */}
        <div className="request-sent-action-wrapper">
          <Button
            type="button"
            className={`btn-request-sent-continue mhn-btn-loading-flex ${isLoading ? 'mhn-loading' : ''}`}
            onClick={handleContinueClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" color="#FFFFFF" />
                <span>Continuing...</span>
              </>
            ) : (
              REQUEST_SENT_STRINGS.continueButton
            )}
          </Button>
        </div>

        {/* Public Content Feature Cards Grid */}
        <div className="request-sent-features-grid">
          <PublicFeatureCard
            icon={ <Image
            src="/publicTournaments.png"
            alt="Status Visualization"
            width={40}
            height={40}
          />}
            title={REQUEST_SENT_STRINGS.featureTournamentsTitle}
            description={REQUEST_SENT_STRINGS.featureTournamentsDesc}
            onClick={onSelectTournament}
          />

          <PublicFeatureCard
            icon={ <Image
            src="/communityBoard.png"
            alt="Status Visualization"
            width={40}
            height={40}
          />}
            title={REQUEST_SENT_STRINGS.featureCommunityTitle}
            description={REQUEST_SENT_STRINGS.featureCommunityDesc}
            onClick={onSelectCommunity}
          />
        </div>
      </div>
    </div>
  );
};
