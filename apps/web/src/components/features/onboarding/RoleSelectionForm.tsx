import React from 'react';
import type { OnboardingFormProps } from '../../../types/onboarding';
import { OnboardingHeader } from './OnboardingHeader';
import { RoleOptionCard } from './RoleOptionCard';
import { Button } from '../../common/Button';

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

      <Button onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
};
