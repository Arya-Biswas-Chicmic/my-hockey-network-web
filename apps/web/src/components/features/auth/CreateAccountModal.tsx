import React from 'react';
import { OnboardingIllustration } from '../onboarding/OnboardingIllustration';
import { CreateAccountForm } from './CreateAccountForm';

interface CreateAccountModalProps {
  onSignUp?: (data: { fullName: string; email: string; dob: string; password: string }) => void;
  onGoogleSignIn?: () => void;
  onBack?: () => void;
  onSignInClick?: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  onSignUp,
  onGoogleSignIn,
  onBack,
  onSignInClick,
}) => {
  return (
    <div className="onboarding-modal">
      <OnboardingIllustration />
      <CreateAccountForm
        onSignUp={onSignUp}
        onGoogleSignIn={onGoogleSignIn}
        onBack={onBack}
        onSignInClick={onSignInClick}
      />
    </div>
  );
};
