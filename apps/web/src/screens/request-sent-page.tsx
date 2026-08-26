import React from 'react';
import { RequestSentCard } from '@/components/features/auth';

interface RequestSentPageProps {
  onComplete?: () => void;
}

export const RequestSentPage: React.FC<RequestSentPageProps> = ({ onComplete }) => {
  const handleContinue = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <main className="onboarding-screen" aria-label="Request Sent Confirmation Page">
      <RequestSentCard
        onContinue={handleContinue}
        onSelectTournament={handleContinue}
        onSelectCommunity={handleContinue}
      />
    </main>
  );
};
