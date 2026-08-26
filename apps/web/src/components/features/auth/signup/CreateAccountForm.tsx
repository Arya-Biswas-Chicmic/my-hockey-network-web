import React from 'react';
import { Formik, Form } from 'formik';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { FormikInput } from '@/components/common/form/FormikInput';
import { FormikDateInput } from '@/components/common/form/FormikDateInput';
import { CREATE_ACCOUNT_STRINGS } from '@my-hockey-network/shared';
import { createAccountSchema, CreateAccountFormValues } from '@my-hockey-network/validation';

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
  const initialValues: CreateAccountFormValues = {
    fullName: '',
    email: '',
    dob: '',
  };

  const handleFormSubmit = (values: CreateAccountFormValues) => {
    if (onSignUp) {
      onSignUp({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        dob: values.dob.trim(),
      });
    }
  };

  return (
    <div className="onboarding-form">
      {onBack && (
        <Button
          type="button"
          onClick={onBack}
          className="mhn-btn-back-link"
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

      <Formik<CreateAccountFormValues>
        initialValues={initialValues}
        validationSchema={createAccountSchema(selectedRole)}
        onSubmit={handleFormSubmit}
        validateOnBlur
        validateOnChange
      >
        {({ isSubmitting }) => (
          <Form className="auth-form-stack" noValidate>
            <FormikInput
              name="fullName"
              label={CREATE_ACCOUNT_STRINGS.fullNameLabel}
              placeholder={CREATE_ACCOUNT_STRINGS.fullNamePlaceholder}
              maxLength={50}
              isNameInput
            />

            <FormikInput
              name="email"
              type="email"
              label={CREATE_ACCOUNT_STRINGS.emailLabel}
              placeholder={CREATE_ACCOUNT_STRINGS.emailPlaceholder}
              maxLength={100}
              isEmailInput
            />

            <FormikDateInput
              name="dob"
              label={CREATE_ACCOUNT_STRINGS.dobLabel}
              placeholder={CREATE_ACCOUNT_STRINGS.dobPlaceholder}
              showAgeBadge
            />

            <Button
              type="submit"
              className={`btn-submit ${loading || isSubmitting ? 'mhn-loading' : ''}`}
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? (
                <span className="mhn-btn-loading-flex">
                  <Spinner size="sm" color="#FFFFFF" />
                  <span>Sending Code...</span>
                </span>
              ) : (
                CREATE_ACCOUNT_STRINGS.submitButton
              )}
            </Button>
          </Form>
        )}
      </Formik>

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
