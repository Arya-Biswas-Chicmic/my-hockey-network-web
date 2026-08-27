import { Button } from '@/components/common/Button';
import React, { useMemo } from 'react';
import { CREATE_ACCOUNT_STRINGS } from '@my-hockey-network/shared';
import { createAccountFormSchema, type CreateAccountFormValues } from '@my-hockey-network/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Spinner } from '@/components/common/Spinner';
import { GoogleIcon } from '@/components/icons/BrandIcons';
import { Form } from '@/components/ui/form';
import { FormDateInput, FormInput } from '@/components/form/fields';

interface CreateAccountFormProps {
  selectedRole?: string;
  onSignUp?: (data: { fullName: string; email: string; dob: string }) => void;
  onGoogleSignIn?: () => void;
  onSignInClick?: () => void;
  loading?: boolean;
}

export const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  selectedRole = 'player',
  onSignUp,
  onGoogleSignIn,
  onSignInClick,
  loading = false,
}) => {
  const schema = useMemo(() => createAccountFormSchema(selectedRole), [selectedRole]);
  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { fullName: '', email: '', dob: '' },
  });
  const handleSubmit = form.handleSubmit((values) => onSignUp?.({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      dob: values.dob.trim(),
    }));

  return (
    <div className="onboarding-form">
      <div className="header-wrapper">
        <h1 className="onboarding-title">{CREATE_ACCOUNT_STRINGS.title}</h1>
        <p className="onboarding-subtitle">{CREATE_ACCOUNT_STRINGS.subtitle}</p>
      </div>

      <Form methods={form} onSubmit={handleSubmit} className="auth-form-stack" noValidate>
        <FormInput<CreateAccountFormValues, 'fullName'> name="fullName" label={CREATE_ACCOUNT_STRINGS.fullNameLabel} maxLength={50} showCharacterCount={false} placeholder={CREATE_ACCOUNT_STRINGS.fullNamePlaceholder} isNameInput required />
        <FormInput<CreateAccountFormValues, 'email'> name="email" label={CREATE_ACCOUNT_STRINGS.emailLabel} type="email" maxLength={100} showCharacterCount={false} placeholder={CREATE_ACCOUNT_STRINGS.emailPlaceholder} isEmailInput required />
        <FormDateInput<CreateAccountFormValues, 'dob'> name="dob" label={CREATE_ACCOUNT_STRINGS.dobLabel} placeholder={CREATE_ACCOUNT_STRINGS.dobPlaceholder} required />

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
      </Form>

      <Button
        type="button"
        className="btn-google"
        onClick={onGoogleSignIn}
      >
        <GoogleIcon className="google-icon-svg" width={20} height={20} />
        <span>{CREATE_ACCOUNT_STRINGS.googleButton}</span>
      </Button>

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
