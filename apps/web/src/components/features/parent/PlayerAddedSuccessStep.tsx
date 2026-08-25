import React from 'react';
import { Button } from '../../common/Button';

interface PlayerAddedSuccessStepProps {
  playerName: string;
  type?: 'create' | 'link';
  childEmail?: string;
  onFinish: () => void;
  onAddAnother: () => void;
}

export const PlayerAddedSuccessStep: React.FC<PlayerAddedSuccessStepProps> = ({
  playerName,
  type = 'create',
  childEmail,
  onFinish,
  onAddAnother,
}) => {
  const [isFinishing, setIsFinishing] = React.useState(false);

  const handleGoHomeClick = async () => {
    setIsFinishing(true);
    try {
      await onFinish();
    } catch {
      setIsFinishing(false);
    }
  };

  const formatShortPlayerName = (name: string, maxLen = 14): string => {
    if (!name) return 'Player';
    const trimmed = name.trim();
    if (trimmed.length <= maxLen) return trimmed;
    const words = trimmed.split(/\s+/);
    if (words.length > 1 && words[0].length <= maxLen) {
      return `${words[0]}...`;
    }
    return `${trimmed.slice(0, maxLen)}...`;
  };

  const displayNameShort = formatShortPlayerName(playerName, 14);

  return (
    <div className="mhn-parent-step-container mhn-text-center mhn-parent-step-container-max380">
      <div className="mhn-parent-icon-circle mhn-green">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="mhn-parent-step-title">
        {displayNameShort} has been {type === 'link' ? 'invited' : 'added'}
      </h2>
      <p className="mhn-parent-step-desc mhn-mb-32">
        {type === 'link'
          ? `Invitation sent to ${childEmail}. Waiting for player to accept code.`
          : `You're now managing ${displayNameShort}'s hockey profile.`}
      </p>

      <div className="mhn-col-flex-gap-12">
        <Button
          type="button"
          className="mhn-parent-btn-primary mhn-btn-loading-flex"
          onClick={handleGoHomeClick}
          disabled={isFinishing}
        >
          {isFinishing ? (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="mhn-spin"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" fill="none" />
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            'Go to Home'
          )}
        </Button>
        <Button type="button" className="mhn-parent-btn-secondary" onClick={onAddAnother} disabled={isFinishing}>
          Add Another Player
        </Button>
      </div>
    </div>
  );
};
