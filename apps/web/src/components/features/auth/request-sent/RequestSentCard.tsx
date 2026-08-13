import React from 'react';
import { REQUEST_SENT_STRINGS } from '@my-hockey-network/shared';
import { RequestSentBadgeIcon, HockeyTournamentIcon, CommunityBoardIcon } from './RequestSentIcons';
import { PublicFeatureCard } from './PublicFeatureCard';

interface RequestSentCardProps {
  onContinue?: () => void;
  onSelectTournament?: () => void;
  onSelectCommunity?: () => void;
}

export const RequestSentCard: React.FC<RequestSentCardProps> = ({
  onContinue = () => alert('Navigating to main dashboard...'),
  onSelectTournament = () => alert('Navigating to Public Tournaments...'),
  onSelectCommunity = () => alert('Navigating to Community Board...'),
}) => {
  return (
    <div className="request-sent-modal">
      <div className="request-sent-content">
        {/* Top Status Visualization Icon */}
        <div className="request-sent-badge-wrapper">
          <img
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
          <button
            type="button"
            className="btn-request-sent-continue"
            onClick={onContinue}
          >
            {REQUEST_SENT_STRINGS.continueButton}
          </button>
        </div>

        {/* Public Content Feature Cards Grid */}
        <div className="request-sent-features-grid">
          <PublicFeatureCard
            icon={ <img
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
            icon={ <img
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
