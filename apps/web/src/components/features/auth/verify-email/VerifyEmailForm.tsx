import { Button } from '../../../common/Button';
import { Input } from '../../../common/FormControls';
import React, { useState, useRef, useEffect } from 'react';
import { Spinner } from '../../../common/Spinner';
import { maskEmail } from '@my-hockey-network/validation';

interface VerifyEmailFormProps {
  email?: string;
  onConfirm?: (code: string) => void;
  onChangeEmail?: () => void;
  onResendCode?: () => void;
  loading?: boolean;
  errorMessage?: string | null;
  resendNotice?: string | null;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({
  email = 'sarah@email.com',
  onConfirm,
  onChangeEmail,
  onResendCode,
  loading = false,
  errorMessage = null,
  resendNotice = null,
}) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(59);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (otpError) setOtpError(null);

    const cleanVal = value.replace(/\D/g, '');

    if (value.length > 1) {
      // Handle paste of 6 numeric digits
      const digits = cleanVal.slice(0, 6).split('');
      if (digits.length === 0) return;
      const newCode = [...code];
      digits.forEach((d, i) => {
        newCode[i] = d;
      });
      setCode(newCode);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const singleDigit = cleanVal.slice(0, 1);
    const newCode = [...code];
    newCode[index] = singleDigit;
    setCode(newCode);

    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (
      e.key === 'Tab' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'Delete' ||
      e.key === 'Enter' ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Reject non-digit keystrokes
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    // Pre-API Client Validation: All 6 digits must be entered!
    if (fullCode.length < 6 || code.some((d) => !d.trim())) {
      setOtpError('Please fill out all 6 digits of the verification code.');
      // Focus first empty box
      const firstEmptyIdx = code.findIndex((d) => !d.trim());
      if (firstEmptyIdx !== -1) {
        inputRefs.current[firstEmptyIdx]?.focus();
      }
      return;
    }

    setOtpError(null);
    if (onConfirm) {
      onConfirm(fullCode);
    }
  };

  const handleResendClick = () => {
    if (resendCooldown > 0 || loading) return;
    if (onResendCode) {
      onResendCode();
    }
    setResendCooldown(59);
  };

  const activeError = otpError || errorMessage;

  const formattedTimer = `00:${resendCooldown.toString().padStart(2, '0')}`;
  const isLastTenSeconds = resendCooldown <= 10 && resendCooldown > 0;

  return (
    <div className="onboarding-form verify-email-form-container">
      {onChangeEmail && (
        <Button
          type="button"
          onClick={onChangeEmail}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#0B66C2',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            marginBottom: '12px',
            padding: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back</span>
        </Button>
      )}

      <div className="header-wrapper verify-email-header-wrapper">
        <h1 className="onboarding-title verify-email-title">
          Check your email
        </h1>
        <p className="onboarding-subtitle verify-email-subtitle">
          We sent a verification code to <br />
          <span className="verify-email-highlight">{maskEmail(email)}</span>
        </p>
      </div>

      {resendNotice && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            color: '#166534',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          ✓ {resendNotice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="verify-email-form">
        <div className="otp-inputs-row" style={{ position: 'relative' }}>
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`otp-digit-input ${activeError ? 'mhn-input-invalid' : ''}`}
              disabled={loading}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Standardized Edit Profile Reference Validation Error Format */}
        {activeError && (
          <div className="mhn-edit-profile-field-error" style={{ marginTop: '12px', justifyContent: 'center' }}>
            <span>⚠️</span>
            <span>{activeError}</span>
          </div>
        )}

        <Button
          type="submit"
          className="btn-submit btn-confirm-otp"
          disabled={loading}
          style={{ opacity: loading ? 0.75 : 1, marginTop: '24px' }}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Spinner size="sm" color="#FFFFFF" />
              <span>Verifying...</span>
            </span>
          ) : (
            'Confirm'
          )}
        </Button>
      </form>

      {/* Change Email */}
      <Button
        type="button"
        onClick={onChangeEmail}
        disabled={loading}
        className="auth-back-link btn-change-email"
        style={{
          marginTop: '16px',
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        Change Email
      </Button>

      {/* Resend Code Footer */}
      <div className="auth-footer-text verify-email-footer" style={{ marginTop: '16px' }}>
        <span>Don’t Receive the code? </span>
        {resendCooldown > 0 ? (
          <span
            style={{
              color: isLastTenSeconds ? '#EF4444' : '#64748B',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'color 0.3s ease',
              display: 'inline-block',
              marginLeft: '4px',
            }}
          >
            Resend OTP in {formattedTimer}
          </span>
        ) : (
          <Button
            type="button"
            onClick={handleResendClick}
            disabled={loading}
            className="auth-primary-link btn-resend-code"
            style={{
              color: '#0B66C2',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            Resend OTP
          </Button>
        )}
      </div>
    </div>
  );
};
