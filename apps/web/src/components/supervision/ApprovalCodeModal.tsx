import React, { useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { OtpCodeInput } from '@/components/common/OtpCodeInput';
import { sixDigitOtpSchema } from '@my-hockey-network/validation';
import { useFormik } from 'formik';
import { ShieldCheck, X } from 'lucide-react';

interface ApprovalCodeModalProps {
  isOpen: boolean;
  targetName: string;
  initialCode?: string;
  loading?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void> | void;
}

export const ApprovalCodeModal: React.FC<ApprovalCodeModalProps> = ({
  isOpen,
  targetName,
  initialCode,
  loading = false,
  errorMessage,
  onClose,
  onSubmit,
}) => {
  const formik = useFormik({
    initialValues: { code: initialCode?.slice(0, 6) || '' },
    validate: ({ code }) => {
      const result = sixDigitOtpSchema.safeParse(code);
      return result.success ? {} : { code: result.error.issues[0]?.message };
    },
    onSubmit: async ({ code }, helpers) => {
      try {
        await onSubmit(code);
      } catch (error) {
        helpers.setFieldError(
          'code',
          error instanceof Error ? error.message : 'Failed to approve request. Please check code and try again.',
        );
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      formik.resetForm({ values: { code: initialCode?.slice(0, 6) || '' } });
    }
  }, [isOpen, initialCode]);

  useEffect(() => {
    if (errorMessage) {
      formik.setFieldError('code', errorMessage);
    }
  }, [errorMessage]);

  if (!isOpen) return null;

  const activeError =
    ((formik.touched.code || formik.submitCount > 0) ? formik.errors.code : null) || errorMessage;

  return (
    <div className="mhn-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mhn-modal-card mhn-parent-step-container-max440" onClick={(e) => e.stopPropagation()}>
        <div className="mhn-modal-header">
          <div className="mhn-modal-badge-icon">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <Button type="button" className="mhn-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} aria-hidden="true" />
          </Button>
        </div>

        <div className="mhn-modal-body">
          <h2 className="mhn-modal-title">Approve Supervision</h2>
          <p className="mhn-modal-subtitle">
            Enter the 6-digit approval code sent for <strong>{targetName || 'the athlete'}</strong>.
          </p>

          <form onSubmit={formik.handleSubmit} className="mhn-modal-form" noValidate>
            <OtpCodeInput
              value={formik.values.code}
              onChange={(code) => void formik.setFieldValue('code', code, true)}
              onComplete={(code) => {
                void formik.setFieldValue('code', code, false);
                void Promise.resolve(onSubmit(code)).catch((error: unknown) => {
                  formik.setFieldError(
                    'code',
                    error instanceof Error ? error.message : 'Failed to approve request. Please check code and try again.',
                  );
                });
              }}
              error={activeError}
              disabled={loading}
              className="mhn-otp-inputs-center"
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
                  'Confirm & Approve'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
