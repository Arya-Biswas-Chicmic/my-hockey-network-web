import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/FormControls';
import { Spinner } from '@/components/common/Spinner';

export interface PostEditModalProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
}

/** Feed post card's "Edit Post" modal. Extracted from `FeedPostCard.tsx`;
 * the caller only renders this when open, so there's no `isOpen` prop here. */
export function PostEditModal({ value, onChange, onClose, onSave, isSaving }: Readonly<PostEditModalProps>) {
  return (
    <div className="mhn-modal-overlay" onClick={onClose}>
      <div className="mhn-modal-card mhn-edit-post-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="mhn-edit-post-header">
          <h3 className="mhn-edit-post-title">Edit Post</h3>
          <Button onClick={onClose} className="mhn-edit-post-close-btn">
            ✕
          </Button>
        </div>

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="mhn-edit-post-textarea"
        />

        <div className="mhn-edit-post-actions">
          <Button onClick={onClose} className="mhn-btn-edit-cancel">
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="mhn-btn-edit-save">
            {isSaving && <Spinner size="sm" color="#FFFFFF" />}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
