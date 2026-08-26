import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Modal } from '@/components/ui/modal';
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
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Delete Team Entry"
      className="mhn-delete-modal-card"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
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
          Are you sure you want to delete {teamName ? <strong>&quot;{teamName}&quot;</strong> : 'this team'} from your career history? This action cannot be undone.
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
    </Modal>
  );
};
