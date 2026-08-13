import React from 'react';
import { GUARDIAN_APPROVAL_STRINGS } from '@my-hockey-network/shared';

interface GuardianActionButtonsProps {
  onSignOut?: () => void;
}

export const GuardianActionButtons: React.FC<GuardianActionButtonsProps> = ({ onSignOut }) => {
  return (
    <div className="guardian-button-stack">
      <button type="submit" className="btn-guardian-primary">
        {GUARDIAN_APPROVAL_STRINGS.sendRequestButton}
      </button>

      <button
        type="button"
        className="btn-guardian-secondary"
        onClick={onSignOut}
      >
        {GUARDIAN_APPROVAL_STRINGS.signOutButton}
      </button>
    </div>
  );
};
