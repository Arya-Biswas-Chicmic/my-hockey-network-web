import React, { useState } from 'react';
import { Spinner } from '../../../common/Spinner';

interface LoginFormProps {
  onSignIn?: (email: string) => void;
  onGoogleSignIn?: () => void;
  onSignUpClick?: () => void;
  loading?: boolean;
  errorMessage?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSignIn,
  onGoogleSignIn,
  onSignUpClick,
  loading = false,
  errorMessage = null,
}) => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const computeEmailError = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Please fill out this field.';
    }
    if (!trimmed.includes('@')) {
      return `Please include an '@' in the email address. '${trimmed}' is missing an '@'.`;
    }
    if (trimmed.indexOf('@') === 0) {
      return `Please enter a part preceding '@'. '${trimmed}' is incomplete.`;
    }
    if (trimmed.endsWith('@')) {
      return `Please enter a part following '@'. '${trimmed}' is incomplete.`;
    }
    const parts = trimmed.split('@');
    if (parts.length > 2) {
      return `An email address cannot contain multiple '@' symbols in '${trimmed}'.`;
    }
    const domain = parts[1];
    if (!domain.includes('.')) {
      return `Please include a valid domain (e.g. .com) in '${trimmed}'.`;
    }
    if (domain.endsWith('.')) {
      return `Please enter a domain suffix after '.' in '${trimmed}'.`;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return `Please enter a valid email address. '${trimmed}' is invalid.`;
    }
    return null;
  };

  const validateEmail = (val: string): boolean => {
    const err = computeEmailError(val);
    setValidationError(err);
    return err === null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (validationError) {
      const err = computeEmailError(val);
      setValidationError(err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      return;
    }
    if (onSignIn) {
      onSignIn(email.trim());
    }
  };

  const activeError = validationError || errorMessage;

  return (
    <div className="onboarding-form">
      <div className="header-wrapper">
        <h1 className="onboarding-title">Sign In</h1>
        <p className="onboarding-subtitle">Enter your email to receive a 6-digit code to log in to your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-stack">
        <div className="auth-form-group" style={{ position: 'relative' }}>
          <label className="auth-label" htmlFor="loginEmail">
            Email Address
          </label>
          <div className="auth-input-wrapper">
            <input
              id="loginEmail"
              type="text"
              className="auth-input"
              placeholder="enter email address"
              value={email}
              onChange={handleChange}
              onBlur={() => {
                if (email) validateEmail(email);
              }}
              style={
                activeError
                  ? {
                      borderColor: '#1D61D1',
                      outline: 'none',
                      boxShadow: '0 0 0 3px rgba(29, 97, 209, 0.2)',
                    }
                  : {}
              }
            />
          </div>

          {/* Floating Tooltip Callout Bubble (HTML5 Validation Style) */}
          {activeError && (
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
              {/* Pointer Triangle Arrow */}
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
        </div>

        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
          style={{ opacity: loading ? 0.75 : 1, marginTop: '28px' }}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Spinner size="sm" color="#FFFFFF" />
              <span>Sending Code...</span>
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <button
        type="button"
        className="btn-google"
        onClick={onGoogleSignIn}
        style={{ marginTop: '16px' }}
      >
        <svg className="google-icon-svg" width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="auth-footer-text" style={{ marginTop: '24px' }}>
        <span>Don't have an account? </span>
        <button
          type="button"
          className="auth-primary-link"
          onClick={onSignUpClick}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};
