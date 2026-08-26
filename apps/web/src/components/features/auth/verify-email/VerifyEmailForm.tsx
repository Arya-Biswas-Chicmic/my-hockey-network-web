import { Button } from '@/components/common/Button';
import React, { useState, useEffect } from 'react';
import { Spinner } from '@/components/common/Spinner';
import { maskEmail, verificationCodeFormSchema, type VerificationCodeFormValues } from '@my-hockey-network/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { OtpCodeInput } from '@/components/common/OtpCodeInput';
import { ArrowLeft } from 'lucide-react';
import { Form, FormField } from '@/components/ui/form';

interface VerifyEmailFormProps {
  email?: string;
  onConfirm?: (code: string) => void;
  onChangeEmail?: () => void;
  onResendCode?: () => void;
  loading?: boolean;
  errorMessage?: string | null;
  resendNotice?: string | null;
  /**
   * OTP value returned directly by the backend while no email service is
   * wired up (see `OtpRequestResponse.devCode`/`code`). When present, the
   * code field is prefilled so the tester only needs to press Confirm —
   * this never bypasses the Confirm press itself.
   */
  prefillCode?: string | null;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({
  email = 'sarah@email.com',
  onConfirm,
  onChangeEmail,
  onResendCode,
  loading = false,
  errorMessage = null,
  resendNotice = null,
  prefillCode = null,
}) => {
  const [resendCooldown, setResendCooldown] = useState<number>(59);
  const form = useForm<VerificationCodeFormValues>({
    resolver: zodResolver(verificationCodeFormSchema),
    mode: 'onChange',
    defaultValues: { code: prefillCode ?? '' },
  });
  const handleSubmit = form.handleSubmit(({ code }) => onConfirm?.(code));

  useEffect(() => {
    if (prefillCode) form.reset({ code: prefillCode });
  }, [prefillCode, form]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
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

  const activeError =
    form.formState.errors.code?.message || errorMessage;

  const formattedTimer = `00:${resendCooldown.toString().padStart(2, '0')}`;
  const isLastTenSeconds = resendCooldown <= 10 && resendCooldown > 0;

  return (
    <div className="onboarding-form verify-email-form-container">
      {onChangeEmail && (
        <Button
          type="button"
          onClick={onChangeEmail}
          disabled={loading}
          className="mhn-btn-back-link"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
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
          ✓ {resendNotice}
        </div>
      )}

      <Form methods={form} onSubmit={handleSubmit} className="verify-email-form" noValidate>
        <FormField
          name="code"
          render={({ field }) => (
            <OtpCodeInput
              value={field.value}
              onChange={field.onChange}
              error={activeError}
              disabled={loading}
              className="mhn-relative-container"
            />
          )}
        />

        {/* Standardized Edit Profile Reference Validation Error Format */}
        {activeError && (
          <div className="mhn-edit-profile-field-error mhn-error-center-margin">
            <span>{activeError}</span>
          </div>
        )}

        <Button
          type="submit"
          className={`btn-submit btn-confirm-otp mhn-btn-confirm-margin ${loading ? 'mhn-loading' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <span className="mhn-btn-loading-flex">
              <Spinner size="sm" color="#FFFFFF" />
              <span>Verifying...</span>
            </span>
          ) : (
            'Confirm'
          )}
        </Button>
      </Form>

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
