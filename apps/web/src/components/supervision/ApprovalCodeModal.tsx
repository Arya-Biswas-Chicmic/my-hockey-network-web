import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form } from 'formik';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { Spinner } from '@/components/common/Spinner';
import { FormError } from '@/components/common/form/FormError';
import { approvalCodeSchema, ApprovalCodeFormValues } from '@my-hockey-network/validation';

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
  const [apiError, setApiError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (errorMessage) {
      setApiError(errorMessage);
    }
  }, [errorMessage]);

  if (!isOpen) return null;

  const initialValues: ApprovalCodeFormValues = {
    code: initialCode && initialCode.length === 6 ? initialCode : '',
  };

  const handleFormSubmit = async (values: ApprovalCodeFormValues) => {
    setApiError(null);
    try {
      await onSubmit(values.code.trim());
    } catch (err: any) {
      setApiError(err.message || 'Failed to approve request. Please check code and try again.');
    }
  };

  return (
    <div className="mhn-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mhn-modal-card mhn-parent-step-container-max440" onClick={(e) => e.stopPropagation()}>
        <div className="mhn-modal-header">
          <div className="mhn-modal-badge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B66C2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <Button type="button" className="mhn-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>

        <div className="mhn-modal-body">
          <h2 className="mhn-modal-title">Approve Supervision</h2>
          <p className="mhn-modal-subtitle">
            Enter the 6-digit approval code sent for <strong>{targetName || 'the athlete'}</strong>.
          </p>

          <Formik<ApprovalCodeFormValues>
            initialValues={initialValues}
            validationSchema={approvalCodeSchema}
            onSubmit={handleFormSubmit}
            validateOnBlur
            validateOnChange
          >
            {({ values, setFieldValue, setFieldTouched, errors, touched, isSubmitting, submitForm }) => {
              const codeDigits = values.code.padEnd(6, '').slice(0, 6).split('');
              const activeError = (touched.code && errors.code) || apiError;

              const handleDigitChange = (index: number, val: string) => {
                const cleanVal = val.replace(/\D/g, '');
                const currentArr = values.code.padEnd(6, '').slice(0, 6).split('');

                if (val.length > 1) {
                  const pasted = cleanVal.slice(0, 6);
                  setFieldValue('code', pasted);
                  setFieldTouched('code', true, true);
                  const nextIndex = Math.min(pasted.length, 5);
                  inputRefs.current[nextIndex]?.focus();
                  if (pasted.length === 6) setTimeout(() => submitForm(), 50);
                  return;
                }

                currentArr[index] = cleanVal.slice(0, 1);
                const newCode = currentArr.join('').trimEnd();
                setFieldValue('code', newCode);
                setFieldTouched('code', true, true);

                if (cleanVal && index < 5) {
                  inputRefs.current[index + 1]?.focus();
                }

                if (newCode.length === 6) {
                  setTimeout(() => submitForm(), 50);
                }
              };

              const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Backspace') {
                  if (!codeDigits[index] && index > 0) {
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
                <Form className="mhn-modal-form">
                  <div className="otp-inputs-row mhn-otp-inputs-center">
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
                        value={codeDigits[index] || ''}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`otp-digit-input ${activeError ? 'mhn-input-invalid' : ''}`}
                        disabled={loading || isSubmitting}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {activeError && (
                    <span className="mhn-edit-profile-field-error mhn-mb-12 mhn-flex-justify-center">
                      <span>{activeError}</span>
                    </span>
                  )}

                  <div className="mhn-modal-actions mhn-mt-20 mhn-flex-justify-center">
                    <Button type="button" className="mhn-modal-btn-cancel" onClick={onClose} disabled={loading || isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" className="mhn-modal-btn-submit" disabled={loading || isSubmitting}>
                      {loading || isSubmitting ? (
                        <span className="mhn-modal-spinner-wrapper mhn-btn-loading-flex">
                          <Spinner size="sm" color="#FFFFFF" />
                          <span>Confirming...</span>
                        </span>
                      ) : (
                        'Confirm & Approve'
                      )}
                    </Button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};
