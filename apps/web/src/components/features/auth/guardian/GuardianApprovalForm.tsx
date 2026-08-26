import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import React from 'react';
import { GUARDIAN_APPROVAL_STRINGS } from '@my-hockey-network/shared';
import { useFormik } from 'formik';
import { validateGuardianForm } from '@/validation/forms';
import { GuardianFormHeader } from '@/components/features/auth/guardian/GuardianFormHeader';
import { GuardianActionButtons } from '@/components/features/auth/guardian/GuardianActionButtons';

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
  const formik = useFormik({
    initialValues: { email: '' },
    validate: validateGuardianForm,
    onSubmit: ({ email }) => onSendRequest?.(email.trim()),
  });
  const emailError = (formik.touched.email || formik.submitCount > 0) ? formik.errors.email : undefined;

  return (
    <div className="guardian-form-container">
      <GuardianFormHeader />

      <form onSubmit={formik.handleSubmit} className="guardian-form-stack" noValidate>
        <div className="auth-form-group mhn-relative-container">
          <label className="guardian-input-label" htmlFor="guardianEmail">
            {GUARDIAN_APPROVAL_STRINGS.emailLabel}
          </label>
          <div className="auth-input-wrapper">
            <Input
              id="guardianEmail"
              type="email"
              maxLength={100}
              className={`guardian-input ${emailError ? 'mhn-edit-profile-input-error mhn-input-error-orange' : ''}`}
              placeholder={GUARDIAN_APPROVAL_STRINGS.emailPlaceholder}
              {...formik.getFieldProps('email')}
            />
          </div>
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
      </form>

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
