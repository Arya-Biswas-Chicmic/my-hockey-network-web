import React from 'react';
import type { OnboardingFormProps } from '@/types/onboarding';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { RoleOptionCard } from '@/components/features/onboarding/RoleOptionCard';
import { Button } from '@/components/common/Button';
import { ArrowLeft } from 'lucide-react';

interface ExtendedRoleSelectionFormProps extends OnboardingFormProps {
  onBack?: () => void;
}

export const RoleSelectionForm: React.FC<ExtendedRoleSelectionFormProps> = ({
  roleOptions,
  selectedRoles,
  onToggleRole,
  onContinue,
  onBack,
}) => {
  return (
    <div className="onboarding-form">
      {onBack && (
        <Button
          type="button"
          onClick={onBack}
          className="mhn-btn-back-link"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back to Sign In</span>
        </Button>
      )}

      <OnboardingHeader
        title={'How are you\ninvolved in hockey?'}
        subtitle={'Select your role. You can update this\nanytime in your settings'}
      />

      <div className="role-options-stack">
        {roleOptions.map((role) => (
          <RoleOptionCard
            key={role.id}
            role={role}
            isSelected={selectedRoles.includes(role.id)}
            onSelect={onToggleRole}
          />
        ))}
      </div>

      <Button variant="primary" fullWidth onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
};
