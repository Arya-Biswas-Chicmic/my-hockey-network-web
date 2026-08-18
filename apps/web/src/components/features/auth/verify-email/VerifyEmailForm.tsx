import React, { useState, useRef, useEffect } from 'react';
import { Spinner } from '../../../common/Spinner';

interface VerifyEmailFormProps {
  email?: string;
  onConfirm?: (code: string) => void;
  onChangeEmail?: () => void;
  onResendCode?: () => void;
  loading?: boolean;
  errorMessage?: string | null;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({
  email = 'sarah@email.com',
  onConfirm,
  onChangeEmail,
  onResendCode,
  loading = false,
  errorMessage = null,
}) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

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

    if (value.length > 1) {
      // Handle paste of 6 digits
      const digits = value.slice(0, 6).replace(/\D/g, '').split('');
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
    if (resendCooldown > 0) return;
    if (onResendCode) {
      onResendCode();
    }
    setResendCooldown(30);
    setResendNotice(`A new 6-digit code has been sent to ${email}`);
    setTimeout(() => {
      setResendNotice(null);
    }, 4000);
  };

  const activeError = otpError || errorMessage;

  return (
    <div className="onboarding-form verify-email-form-container">
      {onChangeEmail && (
        <button
          type="button"
          onClick={onChangeEmail}
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
          <span>Back</span>
        </button>
      )}

      <div className="header-wrapper verify-email-header-wrapper">
        <h1 className="onboarding-title verify-email-title">
          Check your email
        </h1>
        <p className="onboarding-subtitle verify-email-subtitle">
          We sent a verification code to <br />
          <span className="verify-email-highlight">{email}</span>
        </p>
      </div>

      {resendNotice && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #86EFAC',
            color: '#166534',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          {resendNotice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="verify-email-form" style={{ position: 'relative' }}>
        {/* 6 Digit Input Row */}
        <div className="otp-inputs-row" style={{ position: 'relative' }}>
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
              style={
                activeError && !digit
                  ? { borderColor: '#EA580C', backgroundColor: '#FFF7ED' }
                  : activeError
                  ? { borderColor: '#1D61D1' }
                  : {}
              }
            />
          ))}
        </div>

        {/* Floating Tooltip Callout Bubble for OTP Error */}
        {activeError && (
          <div
            className="mhn-validation-tooltip-bubble"
            style={{
              position: 'absolute',
              top: '68px',
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
              width: '100%',
              fontSize: '13px',
              color: '#18181B',
              fontWeight: 500,
              lineHeight: '1.35',
            }}
          >
            {/* Pointer Triangle Arrow */}
            <div
              style={{
                position: 'absolute',
                top: '-6px',
                left: '24px',
                width: '10px',
                height: '10px',
                backgroundColor: '#FFFFFF',
                borderLeft: '1px solid #71717A',
                borderTop: '1px solid #71717A',
                transform: 'rotate(45deg)',
              }}
            />

            {/* Orange Exclamation Badge */}
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

            {/* Tooltip Text */}
            <span>{activeError}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn-submit btn-confirm-otp"
          disabled={loading}
          style={{ opacity: loading ? 0.75 : 1, marginTop: activeError ? '56px' : '24px' }}
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
        style={{ marginTop: '16px' }}
      >
        Change Email
      </button>

      {/* Resend Code Footer */}
      <div className="auth-footer-text verify-email-footer" style={{ marginTop: '16px' }}>
        <span>Don’t Receive the code? </span>
        <button
          type="button"
          onClick={handleResendClick}
          disabled={resendCooldown > 0}
          className="auth-primary-link btn-resend-code"
          style={{ opacity: resendCooldown > 0 ? 0.6 : 1, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer' }}
        >
          {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
        </button>
      </div>
    </div>
  );
};
