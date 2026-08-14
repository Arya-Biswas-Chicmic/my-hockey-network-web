import React, { useState, useRef } from 'react';
import { Spinner } from '../../../common/Spinner';

interface VerifyEmailFormProps {
  email?: string;
  onConfirm?: (code: string) => void;
  onChangeEmail?: () => void;
  onResendCode?: () => void;
  loading?: boolean;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({
  email = 'sarah@email.com',
  onConfirm,
  onChangeEmail,
  onResendCode,
  loading = false,
}) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of 6 digits
      const digits = value.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((d, i) => {
        newCode[i] = d;
      });
      setCode(newCode);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (onConfirm) {
      onConfirm(fullCode);
    }
  };

  return (
    <div className="onboarding-form verify-email-form-container">
      <div className="header-wrapper verify-email-header-wrapper">
        <h1 className="onboarding-title verify-email-title">
          Check your email
        </h1>
        <p className="onboarding-subtitle verify-email-subtitle">
          We sent a verification code to <br />
          <span className="verify-email-highlight">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="verify-email-form">
        {/* 6 Digit Input Row */}
        <div className="otp-inputs-row">
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="otp-digit-input"
              disabled={loading}
            />
          ))}
        </div>

        <button
          type="submit"
          className="btn-submit btn-confirm-otp"
          disabled={loading}
          style={{ opacity: loading ? 0.75 : 1 }}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Spinner size="sm" color="#FFFFFF" />
              <span>Verifying...</span>
            </span>
          ) : (
            'Confirm'
          )}
        </button>
      </form>

      {/* Change Email */}
      <button
        type="button"
        onClick={onChangeEmail}
        className="auth-back-link btn-change-email"
      >
        Change Email
      </button>

      {/* Resend Code Footer */}
      <div className="auth-footer-text verify-email-footer">
        <span>Don’t Receive the code? </span>
        <button
          type="button"
          onClick={onResendCode}
          className="auth-primary-link btn-resend-code"
        >
          Resend Code
        </button>
      </div>
    </div>
  );
};
