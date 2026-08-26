import React from 'react';
import { OnboardingIllustration } from '@/components/features/onboarding/OnboardingIllustration';
import { CreateAccountForm } from '@/components/features/auth/signup/CreateAccountForm';

interface CreateAccountModalProps {
  onSignUp?: (data: { fullName: string; email: string; dob: string; password?: string }) => void;
  onGoogleSignIn?: () => void;
  onBack?: () => void;
  onSignInClick?: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = (props) => {
  return (
    <div className="onboarding-modal">
      <OnboardingIllustration />
      <CreateAccountForm {...props} />
    </div>
  );
};
