import { Button } from '../../../common/Button';
import { Input } from '../../../common/FormControls';
import React, { useState, useRef, useMemo } from 'react';
import { CREATE_ACCOUNT_STRINGS } from '@my-hockey-network/shared';
import { calculateAge, validateSignUpAgeAndApproval } from '@my-hockey-network/core';
import { Spinner } from '../../../common/Spinner';

interface CreateAccountFormProps {
  selectedRole?: string;
  onSignUp?: (data: { fullName: string; email: string; dob: string }) => void;
  onGoogleSignIn?: () => void;
  onBack?: () => void;
  onSignInClick?: () => void;
  loading?: boolean;
}

export const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  selectedRole = 'player',
  onSignUp,
  onGoogleSignIn,
  onBack,
  onSignInClick,
  loading = false,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Compute real-time age
  const currentAge = useMemo(() => calculateAge(dob), [dob]);

  // Smart DOB auto-formatter: e.g. 10042020 -> 10/04/2020
  const formatDobInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatDobInput(rawVal);
    setDob(formatted);
    setLocalError(null);
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value; // Format: YYYY-MM-DD
    if (dateVal) {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        const [yyyy, mm, dd] = parts;
        setDob(`${dd}/${mm}/${yyyy}`);
        setLocalError(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate Sign Up Age Rules
    const validation = validateSignUpAgeAndApproval(selectedRole, dob);
    
    // Allow minor age check to pass here; parent email is collected post-OTP
    if (currentAge !== null) {
      const roleUpper = selectedRole.toUpperCase();
      if (roleUpper === 'PARENT') {
        if (currentAge < 18) {
          setLocalError('Parent account holders must be at least 18 years old.');
          return;
        }
        if (currentAge > 100) {
          setLocalError('Maximum age limit is 100 years.');
          return;
        }
      } else {
        if (currentAge < 5) {
          setLocalError(`Minimum age for ${selectedRole.toLowerCase()}s is 5 years.`);
          return;
        }
        if (currentAge > 100) {
          setLocalError('Maximum age limit is 100 years.');
          return;
        }
      }
    } else if (dob) {
      setLocalError('Please enter a valid date of birth.');
      return;
    }

    if (onSignUp) {
      onSignUp({
        fullName,
        email,
        dob,
      });
    }
  };

  return (
    <div className="onboarding-form">
      {onBack && (
        <Button
          type="button"
          onClick={onBack}
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
        </Button>
      )}
      <div className="header-wrapper">
        <h1 className="onboarding-title">{CREATE_ACCOUNT_STRINGS.title}</h1>
        <p className="onboarding-subtitle">{CREATE_ACCOUNT_STRINGS.subtitle}</p>
      </div>

      {localError && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '16px',
            border: '1px solid #FCA5A5',
          }}
        >
          {localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-stack">
        <div className="auth-form-group">
          <label className="auth-label" htmlFor="fullName">
            {CREATE_ACCOUNT_STRINGS.fullNameLabel}
          </label>
          <div className="auth-input-wrapper">
            <Input
              id="fullName"
              type="text"
              className="auth-input"
              placeholder={CREATE_ACCOUNT_STRINGS.fullNamePlaceholder}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-label" htmlFor="email">
            {CREATE_ACCOUNT_STRINGS.emailLabel}
          </label>
          <div className="auth-input-wrapper">
            <Input
              id="email"
              type="email"
              className="auth-input"
              placeholder={CREATE_ACCOUNT_STRINGS.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="auth-form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="auth-label" htmlFor="dob">
              {CREATE_ACCOUNT_STRINGS.dobLabel}
            </label>
            {currentAge !== null && currentAge >= 0 && currentAge <= 110 ? (
              <span style={{ fontSize: '12px', fontWeight: 600, color: currentAge < 18 ? '#D97706' : '#4B5563' }}>
                Age: {currentAge} yrs {currentAge < 18 ? '(Under 18)' : ''}
              </span>
            ) : dob.length === 10 ? (
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444' }}>
                Invalid Date
              </span>
            ) : null}
          </div>
          <div className="auth-input-wrapper" style={{ position: 'relative' }}>
            <Input
              id="dob"
              type="text"
              className="auth-input"
              placeholder={CREATE_ACCOUNT_STRINGS.dobPlaceholder}
              value={dob}
              onChange={handleDobChange}
              maxLength={10}
              required
            />
            <img
              src="/calendar.png"
              alt="Calendar"
              className="auth-input-icon auth-input-icon-clickable"
              onClick={handleCalendarClick}
              style={{ cursor: 'pointer' }}
            />
            <Input
              type="date"
              ref={dateInputRef}
              onChange={handleDatePickerChange}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '32px',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                zIndex: 2,
              }}
            />
          </div>
        </div>

        <Button type="submit" className="btn-submit" disabled={loading} style={{ opacity: loading ? 0.75 : 1 }}>
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Spinner size="sm" color="#FFFFFF" />
              <span>Sending Code...</span>
            </span>
          ) : (
            CREATE_ACCOUNT_STRINGS.submitButton
          )}
        </Button>
      </form>

      <Button
        type="button"
        className="btn-google"
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
        <span>{CREATE_ACCOUNT_STRINGS.googleButton}</span>
      </Button>

      {onBack && (
        <Button
          type="button"
          className="auth-back-link"
          onClick={onBack}
        >
          {CREATE_ACCOUNT_STRINGS.backButton}
        </Button>
      )}

      <div className="auth-footer-text">
        <span>{CREATE_ACCOUNT_STRINGS.alreadyHaveAccount}</span>
        <Button
          type="button"
          className="auth-primary-link"
          onClick={onSignInClick}
        >
          {CREATE_ACCOUNT_STRINGS.signInLink}
        </Button>
      </div>
    </div>
  );
};
