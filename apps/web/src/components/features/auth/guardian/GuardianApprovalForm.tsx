import { Button } from '../../../common/Button';
import { Input } from '../../../common/FormControls';
import React, { useState } from 'react';
import { GUARDIAN_APPROVAL_STRINGS } from '@my-hockey-network/shared';
import { GuardianFormHeader } from './GuardianFormHeader';
import { GuardianActionButtons } from './GuardianActionButtons';

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
  const [email, setEmail] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Parent / Guardian Email is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const err = validateEmail(email);
    setEmailError(err);
    if (err) {
      return;
    }

    if (onSendRequest) {
      onSendRequest(email.trim());
    }
  };

  return (
    <div className="guardian-form-container">
      <GuardianFormHeader />

      <form onSubmit={handleSubmit} className="guardian-form-stack" noValidate>
        <div className="auth-form-group mhn-relative-container">
          <label className="guardian-input-label" htmlFor="guardianEmail">
            {GUARDIAN_APPROVAL_STRINGS.emailLabel}
          </label>
          <div className="auth-input-wrapper">
            <Input
              id="guardianEmail"
              type="email"
              maxLength={100}
              className={`guardian-input ${hasAttemptedSubmit && emailError ? 'mhn-edit-profile-input-error mhn-input-error-orange' : ''}`}
              placeholder={GUARDIAN_APPROVAL_STRINGS.emailPlaceholder}
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                if (hasAttemptedSubmit) {
                  setEmailError(validateEmail(val));
                }
              }}
            />
          </div>
          {hasAttemptedSubmit && emailError && (
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
