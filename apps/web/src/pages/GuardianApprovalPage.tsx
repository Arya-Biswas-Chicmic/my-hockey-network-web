import React, { useState } from 'react';
import { GuardianApprovalModal, RequestSentCard } from '../components/features/auth';

interface GuardianApprovalPageProps {
  onSendSuccess?: () => void;
  onSignOut?: () => void;
}

export const GuardianApprovalPage: React.FC<GuardianApprovalPageProps> = ({ onSendSuccess, onSignOut }) => {
  const [isSent, setIsSent] = useState(false);

  const handleSendRequest = (_email: string) => {
    setIsSent(true);
    if (onSendSuccess) {
      onSendSuccess();
    }
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      alert('User signed out successfully.');
    }
  };

  const handleContactSupport = () => {
    alert('Navigating to My Hockey Network Support Helpdesk...');
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
          onSignOut={handleSignOut}
          onContactSupport={handleContactSupport}
        />
      )}
    </main>
  );
};
