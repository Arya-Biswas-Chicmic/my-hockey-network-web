import React from 'react';
import type { OnboardingFormProps } from '@/types/onboarding';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { RoleOptionCard } from '@/components/features/onboarding/RoleOptionCard';
import { Button } from '@/components/common/Button';

export const RoleSelectionForm: React.FC<OnboardingFormProps> = ({
  roleOptions,
  selectedRoles,
  onToggleRole,
  onContinue,
}) => {
  return (
    <div className="onboarding-form">
      <OnboardingHeader
        title={'How are you\ninvolved in hockey?'}
        subtitle={'Select all that apply. You can update this\nanytime in your settings'}
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

      <Button variant="primary" fullWidth onClick={onContinue} aria-label="Continue with selected role">
        Continue
      </Button>
    </div>
  );
};
