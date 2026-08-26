import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import React from 'react';
import { Spinner } from '@/components/common/Spinner';
import { useFormik } from 'formik';
import { validateLoginForm } from '@/validation/forms';
import { GoogleIcon } from '@/components/icons/BrandIcons';

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
  const formik = useFormik({
    initialValues: { email: '' },
    validate: validateLoginForm,
    onSubmit: ({ email }) => onSignIn?.(email.trim()),
  });

  const activeError =
    ((formik.touched.email || formik.submitCount > 0) ? formik.errors.email : null) || errorMessage;

  return (
    <div className="onboarding-form">
      <div className="header-wrapper">
        <h1 className="onboarding-title">Sign In</h1>
        <p className="onboarding-subtitle">Enter your email to receive a 6-digit code to log in to your account.</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="auth-form-stack" noValidate>
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
              {...formik.getFieldProps('email')}
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
        <GoogleIcon className="google-icon-svg" width={20} height={20} />
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
