import { Button } from '@/components/common/Button';
import React from 'react';
import { GUARDIAN_APPROVAL_STRINGS } from '@my-hockey-network/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { guardianFormSchema, type GuardianFormValues } from '@my-hockey-network/validation';
import { GuardianFormHeader } from '@/components/features/auth/guardian/GuardianFormHeader';
import { GuardianActionButtons } from '@/components/features/auth/guardian/GuardianActionButtons';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/form/fields/form-input';

interface GuardianApprovalFormProps {
  onSendRequest?: (email: string) => void;
  onSignOut?: () => void;
  onSkip?: () => void;
  onContactSupport?: () => void;
  loading?: boolean;
}

export const GuardianApprovalForm: React.FC<GuardianApprovalFormProps> = ({
  onSendRequest,
  onSignOut,
  onSkip,
  onContactSupport,
  loading = false,
}) => {
  const form = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianFormSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });
  const emailError = form.formState.errors.email?.message;
  const handleSubmit = form.handleSubmit(({ email }) => onSendRequest?.(email.trim()));

  return (
    <div className="guardian-form-container">
      <GuardianFormHeader />

      <Form methods={form} onSubmit={handleSubmit} className="guardian-form-stack" noValidate>
        <div className="auth-form-group mhn-relative-container">
          <FormInput<GuardianFormValues, 'email'>
            name="email"
            label={GUARDIAN_APPROVAL_STRINGS.emailLabel}
            id="guardianEmail"
            type="email"
            maxLength={100}
            inputClassName="guardian-input"
            placeholder={GUARDIAN_APPROVAL_STRINGS.emailPlaceholder}
            isEmailInput
            hideMessage
          />
          {emailError && (
            <div className="mhn-validation-tooltip-bubble">
              <div className="mhn-validation-tooltip-arrow" />
              <div className="mhn-validation-tooltip-badge">
                !
              </div>
              <span>{emailError}</span>
            </div>
          )}
        </div>

        <GuardianActionButtons onSignOut={onSignOut} onSkip={onSkip} loading={loading} />
      </Form>

      <div className="guardian-footer-text">
        <span className="trouble-footer">{GUARDIAN_APPROVAL_STRINGS.havingTrouble}</span>
        <Button
          type="button"
          className="guardian-support-link"
          onClick={onContactSupport}
        >
          {GUARDIAN_APPROVAL_STRINGS.contactSupport}
        </Button>
      </div>
    </div>
  );
};
