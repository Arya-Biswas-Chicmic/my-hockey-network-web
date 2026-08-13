import React, { useState } from 'react';
import { OnboardingIllustration } from './OnboardingIllustration';
import { RoleSelectionForm } from './RoleSelectionForm';
import { CreateAccountForm, VerifyEmailForm } from '../auth';
import { DEFAULT_ROLE_OPTIONS, DEFAULT_SELECTED_ROLE_IDS } from '../../../constants/onboarding';

interface OnboardingModalProps {
  onComplete?: (data: { selectedRoles: string[]; accountData?: { fullName: string; email: string; dob: string; password: string } }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(DEFAULT_SELECTED_ROLE_IDS);
  const [accountData, setAccountData] = useState<{ fullName: string; email: string; dob: string; password: string }>({
    fullName: '',
    email: 'sarah@email.com',
    dob: '',
    password: '',
  });

  const handleToggleRole = (id: string) => {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleRoleSelectionContinue = () => {
    setStep(2);
  };

  const handleSignUp = (data: { fullName: string; email: string; dob: string; password: string }) => {
    setAccountData(data);
    setStep(3);
  };

  const handleVerifyConfirm = (_code: string) => {
    if (onComplete) {
      onComplete({ selectedRoles, accountData });
    }
  };

  return (
    <div className="onboarding-modal">
      <OnboardingIllustration imageSrc={step === 3 ? '/OTPbg.png' : '/Welcome.png'} />
      {step === 1 && (
        <RoleSelectionForm
          roleOptions={DEFAULT_ROLE_OPTIONS}
          selectedRoles={selectedRoles}
          onToggleRole={handleToggleRole}
          onContinue={handleRoleSelectionContinue}
        />
      )}
      {step === 2 && (
        <CreateAccountForm
          onSignUp={handleSignUp}
          onGoogleSignIn={() => setStep(3)}
          onBack={() => setStep(1)}
          onSignInClick={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <VerifyEmailForm
          email={accountData.email || 'sarah@email.com'}
          onConfirm={handleVerifyConfirm}
          onChangeEmail={() => setStep(2)}
          onResendCode={() => alert('Verification code resent to ' + (accountData.email || 'sarah@email.com'))}
        />
      )}
    </div>
  );
};
