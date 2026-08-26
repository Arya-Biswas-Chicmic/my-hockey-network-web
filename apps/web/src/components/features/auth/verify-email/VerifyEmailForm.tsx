import React, { useState, useRef, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { Spinner } from '@/components/common/Spinner';
import { FormError } from '@/components/common/form/FormError';
import { maskEmail, yupOtpSchema, OtpFormValues } from '@my-hockey-network/validation';

interface VerifyEmailFormProps {
  email?: string;
  onConfirm?: (code: string) => void;
  onChangeEmail?: () => void;
  onResendCode?: () => void;
  loading?: boolean;
  errorMessage?: string | null;
  resendNotice?: string | null;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({
  email = 'sarah@email.com',
  onConfirm,
  onChangeEmail,
  onResendCode,
  loading = false,
  errorMessage = null,
  resendNotice = null,
}) => {
  const [resendCooldown, setResendCooldown] = useState<number>(59);
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

  const handleResendClick = () => {
    if (resendCooldown > 0 || loading) return;
    if (onResendCode) {
      onResendCode();
    }
    setResendCooldown(59);
  };

  const formattedTimer = `00:${resendCooldown.toString().padStart(2, '0')}`;
  const isLastTenSeconds = resendCooldown <= 10 && resendCooldown > 0;

  const initialValues: OtpFormValues = { otp: '' };

  const handleFormSubmit = (values: OtpFormValues) => {
    if (onConfirm) {
      onConfirm(values.otp.trim());
    }
  };

  return (
    <div className="onboarding-form verify-email-form-container">
      {onChangeEmail && (
        <Button
          type="button"
          onClick={onChangeEmail}
          disabled={loading}
          className="mhn-btn-back-link"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back</span>
        </Button>
      )}

      <div className="header-wrapper verify-email-header-wrapper">
        <h1 className="onboarding-title verify-email-title">
          Check your email
        </h1>
        <p className="onboarding-subtitle verify-email-subtitle">
          We sent a verification code to <br />
          <span className="verify-email-highlight">{maskEmail(email)}</span>
        </p>
      </div>

      {resendNotice && (
        <div className="mhn-resend-notice-card">
          {resendNotice}
        </div>
      )}

      <Formik<OtpFormValues>
        initialValues={initialValues}
        validationSchema={yupOtpSchema}
        onSubmit={handleFormSubmit}
        validateOnBlur
        validateOnChange
      >
        {({ values, setFieldValue, setFieldTouched, errors, touched, isSubmitting }) => {
          const otpDigits = values.otp.padEnd(6, '').slice(0, 6).split('');
          const activeError = (touched.otp && errors.otp) || errorMessage;

          const handleDigitChange = (index: number, val: string) => {
            const cleanVal = val.replace(/\D/g, '');
            if (val.length > 1) {
              const digits = cleanVal.slice(0, 6);
              setFieldValue('otp', digits);
              setFieldTouched('otp', true, true);
              const nextIndex = Math.min(digits.length, 5);
              inputRefs.current[nextIndex]?.focus();
              return;
            }

            const currentArr = values.otp.padEnd(6, '').slice(0, 6).split('');
            currentArr[index] = cleanVal.slice(0, 1);
            const newOtp = currentArr.join('').trimEnd();
            setFieldValue('otp', newOtp);
            setFieldTouched('otp', true, true);

            if (cleanVal && index < 5) {
              inputRefs.current[index + 1]?.focus();
            }
          };

          const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace') {
              if (!otpDigits[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
              }
              return;
            }
            if (
              e.key === 'Tab' ||
              e.key === 'ArrowLeft' ||
              e.key === 'ArrowRight' ||
              e.key === 'Delete' ||
              e.key === 'Enter' ||
              e.ctrlKey ||
              e.metaKey
            ) {
              return;
            }
            if (!/^\d$/.test(e.key)) {
              e.preventDefault();
            }
          };

          return (
            <Form className="verify-email-form">
              <div className="otp-inputs-row mhn-relative-container">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={otpDigits[index] || ''}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`otp-digit-input ${activeError ? 'mhn-input-invalid' : ''}`}
                    disabled={loading || isSubmitting}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {activeError && (
                <div className="mhn-edit-profile-field-error mhn-error-center-margin">
                  <span>{activeError}</span>
                </div>
              )}

              <Button
                type="submit"
                className={`btn-submit btn-confirm-otp mhn-btn-confirm-margin ${loading || isSubmitting ? 'mhn-loading' : ''}`}
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? (
                  <span className="mhn-btn-loading-flex">
                    <Spinner size="sm" color="#FFFFFF" />
                    <span>Verifying...</span>
                  </span>
                ) : (
                  'Confirm'
                )}
              </Button>
            </Form>
          );
        }}
      </Formik>

      {/* Change Email */}
      <Button
        type="button"
        onClick={onChangeEmail}
        disabled={loading}
        className="auth-back-link btn-change-email mhn-mt-16"
      >
        Change Email
      </Button>

      {/* Resend Code Footer */}
      <div className="auth-footer-text verify-email-footer mhn-mt-16">
        <span>Don’t Receive the code? </span>
        {resendCooldown > 0 ? (
          <span className={isLastTenSeconds ? 'mhn-timer-text-urgent' : 'mhn-timer-text'}>
            Resend OTP in {formattedTimer}
          </span>
        ) : (
          <Button
            type="button"
            onClick={handleResendClick}
            disabled={loading}
            className="auth-primary-link btn-resend-code mhn-btn-resend-link"
          >
            Resend OTP
          </Button>
        )}
      </div>
    </div>
  );
};
