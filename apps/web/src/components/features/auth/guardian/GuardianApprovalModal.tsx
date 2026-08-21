import React from 'react';
import { GuardianIllustrationPanel } from './GuardianIllustrationPanel';
import { GuardianApprovalForm } from './GuardianApprovalForm';

interface GuardianApprovalModalProps {
  onSendRequest?: (email: string) => void;
  onSignOut?: () => void;
  onSkip?: () => void;
  onContactSupport?: () => void;
  loading?: boolean;
}

export const GuardianApprovalModal: React.FC<GuardianApprovalModalProps> = ({
  onSendRequest = (email) => alert(`Verification request sent to: ${email}`),
  onSignOut = () => alert('Signed out'),
  onSkip,
  onContactSupport = () => alert('Redirecting to Support...'),
  loading = false,
}) => {
  return (
    <div className="guardian-approval-modal">
      <GuardianIllustrationPanel />
      <GuardianApprovalForm
        onSendRequest={onSendRequest}
        onSignOut={onSignOut}
        onSkip={onSkip}
        onContactSupport={onContactSupport}
        loading={loading}
      />
    </div>
  );
};
