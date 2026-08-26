import React, { useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { OtpCodeInput } from '@/components/common/OtpCodeInput';
import { verificationCodeFormSchema, type VerificationCodeFormValues } from '@my-hockey-network/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ShieldCheck, X } from 'lucide-react';
import { Form, FormField } from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';

interface ApprovalCodeModalProps {
  isOpen: boolean;
  targetName: string;
  initialCode?: string;
  loading?: boolean;
  errorMessage?: string | null;
  title?: string;
  description?: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void> | void;
}

export const ApprovalCodeModal: React.FC<ApprovalCodeModalProps> = ({
  isOpen,
  targetName,
  initialCode,
  loading = false,
  errorMessage,
  title = 'Approve Supervision',
  description,
  submitLabel = 'Confirm & Approve',
  onClose,
  onSubmit,
}) => {
  const form = useForm<VerificationCodeFormValues>({
    resolver: zodResolver(verificationCodeFormSchema),
    mode: 'onChange',
    defaultValues: { code: initialCode?.slice(0, 6) || '' },
  });
  const handleSubmit = form.handleSubmit(async ({ code }) => {
      try {
        await onSubmit(code);
      } catch (error) {
        form.setError('code', {
          message: error instanceof Error ? error.message : 'Failed to approve request. Please check code and try again.',
        });
      }
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ code: initialCode?.slice(0, 6) || '' });
    }
  }, [isOpen, initialCode]);

  useEffect(() => {
    if (errorMessage) {
      form.setError('code', { message: errorMessage });
    }
  }, [errorMessage]);

  const activeError =
    form.formState.errors.code?.message || errorMessage;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      className="mhn-parent-step-container-max440"
      closeOnEscape={!loading}
      closeOnOverlayClick={!loading}
    >
        <div className="mhn-modal-header">
          <div className="mhn-modal-badge-icon">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <Button type="button" className="mhn-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} aria-hidden="true" />
          </Button>
        </div>

        <div className="mhn-modal-body">
          <h2 className="mhn-modal-title">{title}</h2>
          <p className="mhn-modal-subtitle">
            {description ?? <>Enter the 6-digit approval code sent for <strong>{targetName || 'the athlete'}</strong>.</>}
          </p>

          <Form methods={form} onSubmit={handleSubmit} className="mhn-modal-form" noValidate>
            <FormField
              name="code"
              render={({ field }) => (
                <OtpCodeInput
                  value={field.value}
                  onChange={field.onChange}
                  onComplete={(code) => {
                    field.onChange(code);
                    void Promise.resolve(onSubmit(code)).catch((error: unknown) => {
                      form.setError('code', {
                        message: error instanceof Error ? error.message : 'Failed to approve request. Please check code and try again.',
                      });
                    });
                  }}
                  error={activeError}
                  disabled={loading}
                  className="mhn-otp-inputs-center"
                />
              )}
            />

            {/* Standardized Edit Profile Reference Error UI */}
            {activeError && (
              <span className="mhn-edit-profile-field-error mhn-mb-12 mhn-flex-justify-center">
                <span>{activeError}</span>
              </span>
            )}

            <div className="mhn-modal-actions mhn-mt-20 mhn-flex-justify-center">
              <Button type="button" className="mhn-modal-btn-cancel" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="mhn-modal-btn-submit" disabled={loading}>
                {loading ? (
                  <span className="mhn-modal-spinner-wrapper mhn-btn-loading-flex">
                    <Spinner size="sm" color="#FFFFFF" />
                    <span>Confirming...</span>
                  </span>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          </Form>
        </div>
    </Modal>
  );
};
