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
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode || '');
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialCode]);

  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setError('Please enter the complete 6-digit approval code.');
      return;
    }
    try {
      await onSubmit(code);
    } catch (err: any) {
      setError(err.message || 'Failed to approve request. Please check code.');
    }
  };

  return (
    <div className="mhn-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mhn-modal-card" onClick={(e) => e.stopPropagation()}>
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
            Enter the 6-digit approval code provided by <strong>{targetName || 'the athlete'}</strong> to establish parent supervision.
          </p>

          <form onSubmit={handleSubmit} className="mhn-modal-form">
            <div className="mhn-modal-input-group">
              <label htmlFor="approvalCodeInput" className="mhn-modal-label">
                6-Digit Approval Code
              </label>
              <Input
                ref={inputRef}
                id="approvalCodeInput"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                className={`mhn-modal-code-input ${error ? 'mhn-input-error' : ''}`}
                value={code}
                onChange={handleInputChange}
                disabled={loading}
                autoComplete="one-time-code"
              />
              {error && <p className="mhn-modal-error-text">{error}</p>}
            </div>

            <div className="mhn-modal-actions">
              <Button type="button" className="mhn-modal-btn-cancel" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="mhn-modal-btn-submit" disabled={loading || code.length < 6}>
                {loading ? (
                  <span className="mhn-modal-spinner-wrapper">
                    <Spinner size="sm" color="#FFFFFF" />
                    <span>Approving...</span>
                  </span>
                ) : (
                  'Approve Supervision'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
