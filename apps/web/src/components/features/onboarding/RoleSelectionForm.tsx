import React from 'react';
import type { OnboardingFormProps } from '../../../types/onboarding';
import { OnboardingHeader } from './OnboardingHeader';
import { RoleOptionCard } from './RoleOptionCard';
import { Button } from '../../common/Button';

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
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#0B66C2',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '12px',
            padding: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
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
