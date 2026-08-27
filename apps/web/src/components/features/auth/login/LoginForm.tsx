import { Button } from '@/components/common/Button';
import React from 'react';
import { Spinner } from '@/components/common/Spinner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { loginFormSchema, type LoginFormValues } from '@my-hockey-network/validation';
import { GoogleIcon } from '@/components/icons/BrandIcons';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/form/fields/form-input';

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
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });
  const handleSubmit = form.handleSubmit(({ email }) => onSignIn?.(email.trim()));

  return (
    <div className="onboarding-form">
      <div className="header-wrapper">
        <h1 className="onboarding-title">Welcome Back</h1>
        <p className="onboarding-subtitle">Please login your account</p>
      </div>

      <Form methods={form} onSubmit={handleSubmit} className="auth-form-stack" noValidate>
        <FormInput<LoginFormValues, 'email'>
          name="email"
          label="Email Address"
          id="loginEmail"
          type="email"
          placeholder="admin@gmail.com"
          required
          isEmailInput
        />
        {errorMessage && !form.formState.errors.email ? (
          <span className="mhn-edit-profile-field-error"><span>{errorMessage}</span></span>
        ) : null}

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
            'Sign in'
          )}
        </Button>
      </Form>

      <Button
        type="button"
        className="btn-google mhn-btn-google-margin"
        onClick={onGoogleSignIn}
      >
        <GoogleIcon className="google-icon-svg" width={20} height={20} />
        <span>Continue with Google</span>
      </Button>

      <div className="auth-footer-text mhn-auth-footer-margin">
        <span>Didn&apos;t have an account? </span>
        <Button
          type="button"
          className="auth-primary-link"
          onClick={onSignUpClick}
        >
          Signup
        </Button>
      </div>
    </div>
  );
};
