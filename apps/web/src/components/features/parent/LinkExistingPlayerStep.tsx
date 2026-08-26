import React from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { Spinner } from '@/components/common/Spinner';

interface LinkExistingPlayerStepProps {
  childEmail: string;
  onChangeEmail: (email: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export const LinkExistingPlayerStep: React.FC<LinkExistingPlayerStepProps> = ({
  childEmail,
  onChangeEmail,
  onSubmit,
  onBack,
  loading,
}) => {
  const isValid = childEmail && childEmail.includes('@');

  return (
    <div className="mhn-parent-step-container">
      <h2 className="mhn-parent-step-title">Link an Existing Player</h2>
      <p className="mhn-parent-step-desc">
        Enter your player&apos;s email address to send a supervision request.
      </p>

      <div className="auth-form-group mhn-mb-20">
        <label className="auth-label">Player&apos;s Email</label>
        <div className="auth-input-wrapper">
          <Input
            type="email"
            className="auth-input"
            value={childEmail}
            onChange={(e) => onChangeEmail(e.target.value)}
            placeholder="kid@example.com"
          />
        </div>
      </div>

      <div className="mhn-parent-info-banner">
        ℹ️ An invitation code will be sent to your child&apos;s email address. Once they enter the 6-digit code in their account, the guardian link will be active.
      </div>

      <div className="mhn-parent-actions-stack">
        <Button
          type="button"
          disabled={loading || !isValid}
          className="mhn-parent-btn-primary"
          onClick={onSubmit}
        >
          {loading && <Spinner size="sm" color="#FFFFFF" />}
          <span>Send Invitation</span>
        </Button>
        <Button type="button" className="mhn-parent-btn-secondary" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
};
