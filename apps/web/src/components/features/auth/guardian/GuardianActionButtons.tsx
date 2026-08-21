import { Button } from '../../../common/Button';
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
      <Button type="submit" className="btn-guardian-primary" disabled={loading} style={{ opacity: loading ? 0.75 : 1 }}>
        {loading ? 'Sending Invitation...' : GUARDIAN_APPROVAL_STRINGS.sendRequestButton}
      </Button>

      {onSkip ? (
        <Button
          type="button"
          className="btn-guardian-secondary"
          onClick={onSkip}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#F3F4F6',
            color: '#374151',
            borderRadius: '8px',
            fontWeight: 600,
            border: '1px solid #D1D5DB',
            cursor: 'pointer',
            marginTop: '8px',
          }}
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
