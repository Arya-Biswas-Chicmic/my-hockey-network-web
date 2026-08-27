import React from 'react';
import { OnboardingModal } from '@/components/features/onboarding';

import type { AuthMeResponse, OnboardingResponse } from '@my-hockey-network/contracts';

export interface OnboardingCompletionData {
  selectedRoles: string[];
  accountData?: { fullName: string; email: string; dob: string; parentEmail?: string };
  onboardingResult?: OnboardingResponse | AuthMeResponse;
  redirectProfileId?: string;
}

interface OnboardingPageProps {
  onComplete?: (data?: OnboardingCompletionData) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const handleOnboardingComplete = (data: OnboardingCompletionData) => {
    if (onComplete) {
      onComplete(data);
    }
  };

  return (
    <main className="onboarding-screen" aria-label="Role Onboarding Page">
      <OnboardingModal initialMode="login" onComplete={handleOnboardingComplete} />
    </main>
  );
};
