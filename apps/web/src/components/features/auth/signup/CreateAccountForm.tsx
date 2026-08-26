import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import React, { useRef, useMemo } from 'react';
import { CREATE_ACCOUNT_STRINGS } from '@my-hockey-network/shared';
import { calculateAge } from '@my-hockey-network/core';
import { useFormik } from 'formik';
import { validateCreateAccountForm } from '@/validation/forms';
import { Spinner } from '@/components/common/Spinner';
import { GoogleIcon } from '@/components/icons/BrandIcons';
import { ArrowLeft } from 'lucide-react';

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
  const dateInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: { fullName: '', email: '', dob: '' },
    validate: (values) => validateCreateAccountForm(values, selectedRole),
    onSubmit: (values) => onSignUp?.({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      dob: values.dob.trim(),
    }),
  });
  const { fullName, email, dob } = formik.values;
  const fieldErrors = formik.errors;
  const hasAttemptedSubmit = formik.submitCount > 0;
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
    void formik.setFieldValue('dob', formatted, true);
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
        const formatted = `${dd}/${mm}/${yyyy}`;
        void formik.setFieldValue('dob', formatted, true);
      }
    }
  };

  const renderFieldError = (errorMsg?: string) => {
    if (!errorMsg) return null;
    return (
      <span className="mhn-edit-profile-field-error">
        <span>⚠️</span>
        <span>{errorMsg}</span>
      </span>
    );
  };

  return (
    <div className="onboarding-form">
      {onBack && (
        <Button
          type="button"
          onClick={onBack}
          className="mhn-btn-back-link"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back</span>
        </Button>
      )}
      <div className="header-wrapper">
        <h1 className="onboarding-title">{CREATE_ACCOUNT_STRINGS.title}</h1>
        <p className="onboarding-subtitle">{CREATE_ACCOUNT_STRINGS.subtitle}</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="auth-form-stack" noValidate>
        {/* Full Name Field */}
        <div className="auth-form-group">
          <label className="auth-label" htmlFor="fullName">
            {CREATE_ACCOUNT_STRINGS.fullNameLabel}
          </label>
          <div className="auth-input-wrapper">
            <Input
              id="fullName"
              type="text"
              maxLength={50}
              className={`auth-input ${hasAttemptedSubmit && fieldErrors.fullName ? 'mhn-input-invalid' : ''}`}
              placeholder={CREATE_ACCOUNT_STRINGS.fullNamePlaceholder}
              value={fullName}
              onChange={(e) => void formik.setFieldValue('fullName', e.target.value.slice(0, 50), true)}
              onBlur={formik.handleBlur}
              name="fullName"
            />
          </div>
          {hasAttemptedSubmit && renderFieldError(fieldErrors.fullName)}
        </div>

        {/* Email Address Field */}
        <div className="auth-form-group">
          <label className="auth-label" htmlFor="email">
            {CREATE_ACCOUNT_STRINGS.emailLabel}
          </label>
          <div className="auth-input-wrapper">
            <Input
              id="email"
              type="email"
              maxLength={100}
              className={`auth-input ${hasAttemptedSubmit && fieldErrors.email ? 'mhn-input-invalid' : ''}`}
              placeholder={CREATE_ACCOUNT_STRINGS.emailPlaceholder}
              value={email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="email"
            />
          </div>
          {hasAttemptedSubmit && renderFieldError(fieldErrors.email)}
        </div>

        {/* Date of Birth Field */}
        <div className="auth-form-group">
          <div className="mhn-dob-header-row">
            <label className="auth-label" htmlFor="dob">
              {CREATE_ACCOUNT_STRINGS.dobLabel}
            </label>
            {currentAge !== null && currentAge >= 0 && currentAge <= 110 ? (
              <span className={currentAge < 18 ? 'mhn-age-badge-under18' : 'mhn-age-badge-adult'}>
                Age: {currentAge} yrs {currentAge < 18 ? '(Under 18)' : ''}
              </span>
            ) : dob.length === 10 ? (
              <span className="mhn-age-badge-invalid">
                Invalid Date
              </span>
            ) : null}
          </div>
          <div className="auth-input-wrapper mhn-relative-container">
            <Input
              id="dob"
              type="text"
              className={`auth-input ${hasAttemptedSubmit && fieldErrors.dob ? 'mhn-input-invalid' : ''}`}
              placeholder={CREATE_ACCOUNT_STRINGS.dobPlaceholder}
              value={dob}
              onChange={handleDobChange}
              onBlur={formik.handleBlur}
              name="dob"
              maxLength={10}
            />
            <img
              src="/calendar.png"
              alt="Calendar"
              className="auth-input-icon auth-input-icon-clickable mhn-cursor-pointer"
              onClick={handleCalendarClick}
            />
            <Input
              type="date"
              ref={dateInputRef}
              onChange={handleDatePickerChange}
              className="mhn-date-picker-overlay"
            />
          </div>
          {hasAttemptedSubmit && renderFieldError(fieldErrors.dob)}
        </div>

        <Button type="submit" className={`btn-submit ${loading ? 'mhn-loading' : ''}`} disabled={loading}>
          {loading ? (
            <span className="mhn-btn-loading-flex">
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
        <GoogleIcon className="google-icon-svg" width={20} height={20} />
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
