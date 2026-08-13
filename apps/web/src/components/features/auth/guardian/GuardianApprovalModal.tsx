import React from 'react';
import { GuardianIllustrationPanel } from './GuardianIllustrationPanel';
import { GuardianApprovalForm } from './GuardianApprovalForm';

interface GuardianApprovalModalProps {
  onSendRequest?: (email: string) => void;
  onSignOut?: () => void;
  onContactSupport?: () => void;
}

export const GuardianApprovalModal: React.FC<GuardianApprovalModalProps> = ({
  onSendRequest = (email) => alert(`Verification request sent to: ${email}`),
  onSignOut = () => alert('Signed out'),
  onContactSupport = () => alert('Redirecting to Support...'),
}) => {
  return (
    <div className="guardian-approval-modal">
      <GuardianIllustrationPanel />
      <GuardianApprovalForm
        onSendRequest={onSendRequest}
        onSignOut={onSignOut}
        onContactSupport={onContactSupport}
      />
    </div>
  );
};
