import React, { useState } from 'react';
import { OnboardingIllustration } from './OnboardingIllustration';
import { RoleSelectionForm } from './RoleSelectionForm';
import { CreateAccountForm } from '../auth/CreateAccountForm';
import { DEFAULT_ROLE_OPTIONS, DEFAULT_SELECTED_ROLE_IDS } from '../../../constants/onboarding';

interface OnboardingModalProps {
  onComplete?: (data: { selectedRoles: string[]; accountData?: { fullName: string; email: string; dob: string; password: string } }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(DEFAULT_SELECTED_ROLE_IDS);

  const handleToggleRole = (id: string) => {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleRoleSelectionContinue = () => {
    setStep(2);
  };

  const handleSignUp = (data: { fullName: string; email: string; dob: string; password: string }) => {
    alert(`Account created successfully for ${data.fullName}!`);
    if (onComplete) {
      onComplete({ selectedRoles, accountData: data });
    }
  };

  return (
    <div className="onboarding-modal">
      <OnboardingIllustration />
      {step === 1 ? (
        <RoleSelectionForm
          roleOptions={DEFAULT_ROLE_OPTIONS}
          selectedRoles={selectedRoles}
          onToggleRole={handleToggleRole}
          onContinue={handleRoleSelectionContinue}
        />
      ) : (
        <CreateAccountForm
          onSignUp={handleSignUp}
          onGoogleSignIn={() => alert('Continuing with Google...')}
          onBack={() => setStep(1)}
          onSignInClick={() => setStep(1)}
        />
      )}
    </div>
  );
};
