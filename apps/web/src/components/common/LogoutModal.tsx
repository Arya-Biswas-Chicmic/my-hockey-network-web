import { Button } from '@/components/common/Button';
import React from 'react';
import { Spinner } from '@/components/common/Spinner';

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
        <div className="mhn-logout-modal-actions">
          <Button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="mhn-btn-logout-cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="mhn-btn-logout-confirm"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" color="currentColor" />
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
