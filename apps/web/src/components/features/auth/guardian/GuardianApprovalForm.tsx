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
        <div className="auth-form-group" style={{ position: 'relative' }}>
          <label className="guardian-input-label" htmlFor="guardianEmail">
            {GUARDIAN_APPROVAL_STRINGS.emailLabel}
          </label>
          <div className="auth-input-wrapper">
            <Input
              id="guardianEmail"
              type="email"
              maxLength={100}
              className={`guardian-input ${hasAttemptedSubmit && emailError ? 'mhn-edit-profile-input-error' : ''}`}
              placeholder={GUARDIAN_APPROVAL_STRINGS.emailPlaceholder}
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                if (hasAttemptedSubmit) {
                  setEmailError(validateEmail(val));
                }
              }}
              style={hasAttemptedSubmit && emailError ? { borderColor: '#EA580C', backgroundColor: '#FFF7ED' } : {}}
            />
          </div>
          {hasAttemptedSubmit && emailError && (
            <div
              className="mhn-validation-tooltip-bubble"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: '0',
                zIndex: 100,
                backgroundColor: '#FFFFFF',
                border: '1px solid #71717A',
                borderRadius: '6px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                maxWidth: '100%',
                fontSize: '13px',
                color: '#18181B',
                fontWeight: 500,
                lineHeight: '1.35',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '18px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#FFFFFF',
                  borderLeft: '1px solid #71717A',
                  borderTop: '1px solid #71717A',
                  transform: 'rotate(45deg)',
                }}
              />
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#EA580C',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 900,
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
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
