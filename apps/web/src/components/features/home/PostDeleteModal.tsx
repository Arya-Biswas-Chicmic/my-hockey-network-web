import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Trash2 } from 'lucide-react';

export interface PostDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

/** Feed post card's delete-confirmation modal. Extracted from
 * `FeedPostCard.tsx`; the caller only renders this when open. */
export function PostDeleteModal({ onClose, onConfirm, isDeleting }: Readonly<PostDeleteModalProps>) {
  return (
    <div className="mhn-modal-overlay" onClick={() => !isDeleting && onClose()}>
      <div className="mhn-modal-card mhn-delete-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="mhn-delete-modal-header">
          <div className="mhn-dropdown-item-left">
            <div className="mhn-delete-icon-circle">
              <Trash2 size={18} aria-hidden="true" />
            </div>
            <h3 className="mhn-delete-modal-title">Delete Post</h3>
          </div>
          {!isDeleting && (
            <Button onClick={onClose} className="mhn-delete-modal-close" aria-label="Close modal">
              &times;
            </Button>
          )}
        </div>

        <p className="mhn-delete-modal-body">
          Are you sure you want to delete this post? This action is permanent and cannot be undone.
        </p>

        <div className="mhn-delete-modal-actions">
          <Button type="button" onClick={onClose} disabled={isDeleting} className="mhn-btn-modal-cancel">
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isDeleting} className="mhn-btn-modal-danger">
            {isDeleting ? (
              <>
                <Spinner size="sm" color="#FFFFFF" />
                <span>Deleting...</span>
              </>
            ) : (
              'Delete Post'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
