import { Button } from './Button';
import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="mhn-modal-overlay">
      <div className="mhn-modal-card mhn-delete-modal-card">
        {/* Modal Header */}
        <div className="mhn-delete-modal-header">
          <h3 className="mhn-delete-modal-title">
            Log Out
          </h3>
          {!isLoading && (
            <Button
              onClick={onClose}
              className="mhn-delete-modal-close"
              aria-label="Close modal"
            >
              &times;
            </Button>
          )}
        </div>

        {/* Modal Body */}
        <p className="mhn-delete-modal-body">
          Are you sure you want to log out? You will need to sign in again to access your account.
        </p>

        {/* Action Buttons */}
        <div className="mhn-delete-modal-actions">
          <Button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="mhn-btn-modal-cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="mhn-btn-modal-danger"
          >
            {isLoading ? (
              <>
                <svg className="mhn-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" fill="currentColor" />
                </svg>
                <span>Logging out...</span>
              </>
            ) : (
              'Log Out'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
