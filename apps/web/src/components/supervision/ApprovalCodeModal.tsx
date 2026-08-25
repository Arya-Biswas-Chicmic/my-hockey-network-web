import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/FormControls';
import { Spinner } from '../common/Spinner';

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
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialCode && initialCode.length === 6) {
        setDigits(initialCode.split(''));
      } else {
        setDigits(['', '', '', '', '', '']);
      }
      setOtpError(null);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  }, [isOpen, initialCode]);

  useEffect(() => {
    if (errorMessage) {
      setOtpError(errorMessage);
    }
  }, [errorMessage]);

  if (!isOpen) return null;

  const triggerAutoSubmit = (codeDigits: string[]) => {
    const fullCode = codeDigits.join('');
    if (fullCode.length === 6 && codeDigits.every((d) => Boolean(d.trim()))) {
      setOtpError(null);
      onSubmit(fullCode);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (otpError) setOtpError(null);

    const cleanVal = value.replace(/\D/g, '');
    const newDigits = [...digits];

    if (value.length > 1) {
      // Handle paste of 6 numeric digits
      const pastedDigits = cleanVal.slice(0, 6).split('');
      if (pastedDigits.length === 0) return;
      pastedDigits.forEach((d, i) => {
        newDigits[i] = d;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      triggerAutoSubmit(newDigits);
      return;
    }

    const singleDigit = cleanVal.slice(0, 1);
    newDigits[index] = singleDigit;
    setDigits(newDigits);

    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    triggerAutoSubmit(newDigits);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
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

    // Reject non-digit keystrokes
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join('');

    // Pre-API Validation: All 6 digits MUST be entered before hitting API!
    if (fullCode.length < 6 || digits.some((d) => !d.trim())) {
      setOtpError('Please fill out all 6 digits of the verification code.');
      const firstEmptyIdx = digits.findIndex((d) => !d.trim());
      if (firstEmptyIdx !== -1) {
        inputRefs.current[firstEmptyIdx]?.focus();
      }
      return;
    }

    setOtpError(null);
    try {
      await onSubmit(fullCode);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to approve request. Please check code and try again.');
    }
  };

  const activeError = otpError;

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

          <form onSubmit={handleSubmit} className="mhn-modal-form">
            <div className="otp-inputs-row mhn-otp-inputs-center">
              {digits.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`otp-digit-input ${activeError ? 'mhn-input-invalid' : ''}`}
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Standardized Edit Profile Reference Error UI */}
            {activeError && (
              <span className="mhn-edit-profile-field-error mhn-mb-12 mhn-flex-justify-center">
                <span>⚠️</span>
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
