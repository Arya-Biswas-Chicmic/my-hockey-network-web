import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/common/Button';
import { FormikInput } from '@/components/common/form/FormikInput';
import { GUARDIAN_APPROVAL_STRINGS } from '@my-hockey-network/shared';
import { VALIDATION_MESSAGES } from '@my-hockey-network/validation';
import { GuardianFormHeader } from './GuardianFormHeader';
import { GuardianActionButtons } from './GuardianActionButtons';

interface GuardianApprovalFormProps {
  onSendRequest?: (email: string) => void;
  onSignOut?: () => void;
  onSkip?: () => void;
  onContactSupport?: () => void;
  loading?: boolean;
}

const guardianEmailSchema = Yup.object().shape({
  email: Yup.string()
    .transform((value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value))
    .trim()
    .required('Parent / Guardian Email is required.')
    .email(VALIDATION_MESSAGES.invalidEmail),
});

export const GuardianApprovalForm: React.FC<GuardianApprovalFormProps> = ({
  onSendRequest,
  onSignOut,
  onSkip,
  onContactSupport,
  loading = false,
}) => {
  const initialValues = { email: '' };

  const handleFormSubmit = (values: { email: string }) => {
    if (onSendRequest) {
      onSendRequest(values.email.trim());
    }
  };

  return (
    <div className="guardian-form-container">
      <GuardianFormHeader />

      <Formik
        initialValues={initialValues}
        validationSchema={guardianEmailSchema}
        onSubmit={handleFormSubmit}
        validateOnBlur
        validateOnChange
      >
        {() => (
          <Form className="guardian-form-stack" noValidate>
            <FormikInput
              name="email"
              type="email"
              label={GUARDIAN_APPROVAL_STRINGS.emailLabel}
              placeholder={GUARDIAN_APPROVAL_STRINGS.emailPlaceholder}
              maxLength={100}
              inputClassName="guardian-input"
              isEmailInput
            />

            <GuardianActionButtons onSignOut={onSignOut} onSkip={onSkip} loading={loading} />
          </Form>
        )}
      </Formik>

      <div className="guardian-footer-text">
        <span className="trouble-footer">{GUARDIAN_APPROVAL_STRINGS.havingTrouble}</span>
        <Button
          type="button"
          className="guardian-support-link"
          onClick={onContactSupport}
        >
          {GUARDIAN_APPROVAL_STRINGS.contactSupport}
        </Button>
      </div>
    </div>
  );
};
