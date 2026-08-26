import { Button } from '@/components/common/Button';
import React from 'react';
import { GUARDIAN_APPROVAL_STRINGS } from '@my-hockey-network/shared';

interface GuardianActionButtonsProps {
  onSignOut?: () => void;
  onSkip?: () => void;
  loading?: boolean;
}

export const GuardianActionButtons: React.FC<GuardianActionButtonsProps> = ({ onSignOut, onSkip, loading }) => {
  return (
    <div className="guardian-button-stack">
      <Button type="submit" className={`btn-guardian-primary ${loading ? 'mhn-loading' : ''}`} disabled={loading}>
        {loading ? 'Sending Invitation...' : GUARDIAN_APPROVAL_STRINGS.sendRequestButton}
      </Button>

      {onSkip ? (
        <Button
          type="button"
          className="btn-guardian-secondary btn-guardian-skip"
          onClick={onSkip}
        >
          Skip
        </Button>
      ) : (
        <Button
          type="button"
          className="btn-guardian-secondary"
          onClick={onSignOut}
        >
          {GUARDIAN_APPROVAL_STRINGS.signOutButton}
        </Button>
      )}
    </div>
  );
};
