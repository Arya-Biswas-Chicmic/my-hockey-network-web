import React from 'react';
import { OnboardingModal } from '../components/features/onboarding';

interface OnboardingPageProps {
  onComplete?: (data?: any) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const handleOnboardingComplete = (data: { selectedRoles: string[]; accountData?: any; onboardingResult?: any }) => {
    console.log('Onboarding & Signup Complete:', data);
    if (onComplete) {
      onComplete(data);
    }
  };

  return (
    <main className="onboarding-screen" aria-label="Role Onboarding Page">
      <OnboardingModal onComplete={handleOnboardingComplete} />
    </main>
  );
};
