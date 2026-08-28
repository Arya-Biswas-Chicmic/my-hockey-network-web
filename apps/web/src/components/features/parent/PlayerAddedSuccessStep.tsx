import React from 'react';
import { Button } from '@/components/common/Button';
import { Check, LoaderCircle } from 'lucide-react';

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
  const actionLabel = type === 'link' ? 'Done' : `Go to ${displayNameShort}’s Profile`;
  const invitationTarget = childEmail?.trim() || displayNameShort;

  return (
    <div className="mhn-parent-step-container mhn-text-center mhn-parent-step-success">
      <div className="bg-success-surface w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="text-success" size={34} aria-hidden="true" />
      </div>

      <h2 className="mhn-parent-step-title mhn-parent-success-title">
        {displayNameShort} has been {type === 'link' ? 'invited' : 'added'}
      </h2>
      <p className="mhn-parent-step-desc mhn-parent-success-desc">
        {type === 'link'
          ? `Invitation sent to ${invitationTarget}. Waiting for player to accept code.`
          : `You're now managing ${displayNameShort}'s hockey profile.`}
      </p>

      <div className="mhn-parent-success-actions">
        <Button
          type="button"
          className="mhn-parent-btn-primary mhn-btn-loading-flex"
          onClick={handleGoHomeClick}
          disabled={isFinishing}
        >
          {isFinishing ? (
            <>
              <LoaderCircle size={18} className="mhn-spin" aria-hidden="true" />
              <span>Loading...</span>
            </>
          ) : actionLabel}
        </Button>
        <Button type="button" className="mhn-parent-btn-secondary" onClick={onAddAnother} disabled={isFinishing}>
          Add Another Player
        </Button>
      </div>
    </div>
  );
};
