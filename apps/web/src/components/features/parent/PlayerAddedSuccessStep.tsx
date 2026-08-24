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

  return (
    <div className="mhn-parent-step-container" style={{ textAlign: 'center', maxWidth: '380px' }}>
      <div className="mhn-parent-icon-circle mhn-green">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="mhn-parent-step-title">
        {playerName || 'Player'} has been {type === 'link' ? 'invited' : 'added'}
      </h2>
      <p className="mhn-parent-step-desc" style={{ marginBottom: '32px' }}>
        {type === 'link'
          ? `Invitation sent to ${childEmail}. Waiting for player to accept code.`
          : `You're now managing ${playerName || 'Noah'}'s hockey profile.`}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button
          type="button"
          className="mhn-parent-btn-primary"
          onClick={handleGoHomeClick}
          disabled={isFinishing}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
                style={{ animation: 'mhn-spin 0.8s linear infinite' }}
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
