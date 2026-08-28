import { Button } from '@/components/common/Button';
import React, { useEffect, useRef } from 'react';
import { Spinner } from '@/components/common/Spinner';
import { verificationCodeFormSchema, type VerificationCodeFormValues } from '@my-hockey-network/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { OtpCodeInput } from '@/components/common/OtpCodeInput';
import { Form, FormField } from '@/components/ui/form';
import { ResendCountdown, type ResendCountdownHandle } from '@/components/ui/resend-countdown';

/** Seconds a user must wait between verification-code resend requests. */
const RESEND_COOLDOWN_SECONDS = 59;

/** Digits in a verification code; mirrors `verificationCodeFormSchema`. */
const OTP_LENGTH = 6;

interface VerifyEmailFormProps {
  email?: string;
  onConfirm?: (code: string) => void;
  onChangeEmail?: () => void;
  /**
   * Requests a new code. May be async, and may resolve `false` to report that no
   * code was sent — the resend cooldown restarts only on success, so a failed
   * request leaves the button pressable instead of locking the user out with no
   * new code on the way.
   */
  onResendCode?: () => void | boolean | Promise<void | boolean>;
  loading?: boolean;
  errorMessage?: string | null;
  resendNotice?: string | null;
  /**
   * Clears `resendNotice`. Called when the cooldown ends, so the "a new code was
   * sent" confirmation does not outlive the window it describes.
   */
  onResendNoticeExpire?: () => void;
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
  onResendNoticeExpire,
  prefillCode = null,
}) => {
  const resendRef = useRef<ResendCountdownHandle>(null);
  const form = useForm<VerificationCodeFormValues>({
    resolver: zodResolver(verificationCodeFormSchema),
    mode: 'onChange',
    defaultValues: { code: prefillCode ?? '' },
  });
  const handleSubmit = form.handleSubmit(({ code }) => onConfirm?.(code));

  useEffect(() => {
    if (prefillCode) form.reset({ code: prefillCode });
  }, [prefillCode, form]);

  const handleResendClick = async () => {
    if (loading || !onResendCode) return;
    const sent = await onResendCode();
    // A handler that reports nothing is treated as success, preserving the
    // previous behavior for callers that do not signal an outcome.
    if (sent !== false) resendRef.current?.restart();
  };

  const activeError = form.formState.errors.code?.message || errorMessage;
  // `useWatch` rather than `form.watch()`: lint rejects the latter because React
  // Compiler cannot memoize around it (see docs/COMPONENT_CATALOG.md).
  const code = useWatch({ control: form.control, name: 'code' });
  const isCodeComplete = (code ?? '').length === OTP_LENGTH;

  return (
    <div className="onboarding-form verify-email-form-container">
      <div className="header-wrapper verify-email-header-wrapper">
        <h1 className="onboarding-title verify-email-title">
          Check your email
        </h1>
        <p className="onboarding-subtitle verify-email-subtitle">
          We sent a verification code to <br />
          <span className="verify-email-highlight">{email}</span>
        </p>
      </div>

      {resendNotice && (
        <div className="mhn-resend-notice-card" role="status" aria-live="polite">
          <span aria-hidden="true">✓ </span>{resendNotice}
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
          <div className="mhn-edit-profile-field-error mhn-error-center-margin" role="alert">
            <span>{activeError}</span>
          </div>
        )}

        <Button
          type="submit"
          className={`btn-submit btn-confirm-otp mhn-btn-confirm-margin ${loading ? 'mhn-loading' : ''}`}
          disabled={loading || !isCodeComplete}
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
        <ResendCountdown
          ref={resendRef}
          seconds={RESEND_COOLDOWN_SECONDS}
          onResend={handleResendClick}
          disabled={loading}
          onCountdownComplete={onResendNoticeExpire}
        />
      </div>
    </div>
  );
};
