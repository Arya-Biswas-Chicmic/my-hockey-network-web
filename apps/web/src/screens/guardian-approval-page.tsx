import React, { useState } from 'react';
import { GuardianApprovalModal, RequestSentCard } from '@/components/features/auth';

interface GuardianApprovalPageProps {
  onSendSuccess?: () => void;
  onSignOut?: () => void;
  onContactSupport?: () => void;
}

export const GuardianApprovalPage: React.FC<GuardianApprovalPageProps> = ({ onSendSuccess, onSignOut, onContactSupport }) => {
  const [isSent, setIsSent] = useState(false);

  const handleSendRequest = (_email: string) => {
    setIsSent(true);
    if (onSendSuccess) {
      onSendSuccess();
    }
  };

  return (
    <main className="onboarding-screen" aria-label="Guardian Approval Page">
      {isSent ? (
        <RequestSentCard
          onContinue={onSendSuccess}
          onSelectTournament={onSendSuccess}
          onSelectCommunity={onSendSuccess}
        />
      ) : (
        <GuardianApprovalModal
          onSendRequest={handleSendRequest}
          onSignOut={onSignOut}
          onContactSupport={onContactSupport}
        />
      )}
    </main>
  );
};
