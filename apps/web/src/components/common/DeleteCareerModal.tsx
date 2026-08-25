import { Button } from './Button';
import { Spinner } from './Spinner';
import React from 'react';

interface DeleteCareerModalProps {
  isOpen: boolean;
  teamName: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const DeleteCareerModal: React.FC<DeleteCareerModalProps> = ({
  isOpen,
  teamName,
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
            Delete Team Entry
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
          Are you sure you want to delete {teamName ? <strong>"{teamName}"</strong> : 'this team'} from your career history? This action cannot be undone.
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
                <Spinner size="sm" color="#FFFFFF" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
