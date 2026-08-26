import React from 'react';
import { GuardianIllustrationPanel } from '@/components/features/auth/guardian/GuardianIllustrationPanel';
import { GuardianApprovalForm } from '@/components/features/auth/guardian/GuardianApprovalForm';
import { showInfoToast } from '@/utils/toast';

interface GuardianApprovalModalProps {
  onSendRequest?: (email: string) => void;
  onSignOut?: () => void;
  onSkip?: () => void;
  onContactSupport?: () => void;
  loading?: boolean;
}

export const GuardianApprovalModal: React.FC<GuardianApprovalModalProps> = ({
  onSendRequest = () => showInfoToast('Guardian requests are unavailable until the service is configured.'),
  onSignOut = () => showInfoToast('Sign out is unavailable in this context.'),
  onSkip,
  onContactSupport = () => showInfoToast('Support navigation is unavailable in this context.'),
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
