import { Button } from '../../../common/Button';
import { Input } from '../../../common/FormControls';
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
      return 'Email Address is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Enter a valid email address.';
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
        <div className="auth-form-group">
          <label className="auth-label" htmlFor="loginEmail">
            Email Address
          </label>
          <div className="auth-input-wrapper">
            <Input
              id="loginEmail"
              type="text"
              className={`auth-input ${activeError ? 'mhn-input-invalid' : ''}`}
              placeholder="enter email address"
              value={email}
              onChange={handleChange}
              onBlur={() => {
                if (email) validateEmail(email);
              }}
            />
          </div>

          {/* Standardized Edit Profile Reference Error UI */}
          {activeError && (
            <span className="mhn-edit-profile-field-error">
              <span>⚠️</span>
              <span>{activeError}</span>
            </span>
          )}
        </div>

        <Button
          type="submit"
          className={`btn-submit mhn-btn-submit-margin ${loading ? 'mhn-loading' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <span className="mhn-btn-loading-flex">
              <Spinner size="sm" color="#FFFFFF" />
              <span>Sending Code...</span>
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <Button
        type="button"
        className="btn-google mhn-btn-google-margin"
        onClick={onGoogleSignIn}
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
      </Button>

      <div className="auth-footer-text mhn-auth-footer-margin">
        <span>Don't have an account? </span>
        <Button
          type="button"
          className="auth-primary-link"
          onClick={onSignUpClick}
        >
          Sign Up
        </Button>
      </div>
    </div>
  );
};
