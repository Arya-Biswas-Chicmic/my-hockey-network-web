import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/FormControls';
import { Spinner } from '@/components/common/Spinner';

export interface QuoteRepostModalProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/** The "Quote" option from the repost choice popover opens this — add
 * commentary, then repost with it attached (`RepostDTO.commentary`, already
 * supported by `repostPost`/the backend). Modeled on `PostEditModal.tsx`. */
export function QuoteRepostModal({ value, onChange, onClose, onSubmit, isSubmitting }: Readonly<QuoteRepostModalProps>) {
  return (
    <div className="mhn-modal-overlay" onClick={onClose}>
      <div className="mhn-modal-card mhn-edit-post-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="mhn-edit-post-header">
          <h3 className="mhn-edit-post-title">Quote Post</h3>
          <Button onClick={onClose} className="mhn-edit-post-close-btn">
            ✕
          </Button>
        </div>

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Add your thoughts..."
          className="mhn-edit-post-textarea"
        />

        <div className="mhn-edit-post-actions">
          <Button onClick={onClose} className="mhn-btn-edit-cancel">
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting || !value.trim()} className="mhn-btn-edit-save">
            {isSubmitting && <Spinner size="sm" color="#FFFFFF" />}
            <span>Post</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
