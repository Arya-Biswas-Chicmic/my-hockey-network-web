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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSendRequest && email.trim()) {
      onSendRequest(email.trim());
    }
  };

  return (
    <div className="guardian-form-container">
      <GuardianFormHeader />

      <form onSubmit={handleSubmit} className="guardian-form-stack">
        <div className="auth-form-group">
          <label className="guardian-input-label" htmlFor="guardianEmail">
            {GUARDIAN_APPROVAL_STRINGS.emailLabel}
          </label>
          <div className="auth-input-wrapper">
            <input
              id="guardianEmail"
              type="email"
              className="guardian-input"
              placeholder={GUARDIAN_APPROVAL_STRINGS.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <GuardianActionButtons onSignOut={onSignOut} onSkip={onSkip} loading={loading} />
      </form>

      <div className="guardian-footer-text">
        <span className="trouble-footer">{GUARDIAN_APPROVAL_STRINGS.havingTrouble}</span>
        <button
          type="button"
          className="guardian-support-link"
          onClick={onContactSupport}
        >
          {GUARDIAN_APPROVAL_STRINGS.contactSupport}
        </button>
      </div>
    </div>
  );
};
