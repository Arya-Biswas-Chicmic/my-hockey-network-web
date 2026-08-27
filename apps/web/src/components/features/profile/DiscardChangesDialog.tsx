import { Button } from '@/components/common/Button';

export interface DiscardChangesDialogProps {
  onKeepEditing: () => void;
  onDiscard: () => void;
}

/** Generic "you have unsaved changes" confirmation overlay. Extracted from
 * `EditProfileModal.tsx`; the caller only renders this when open. */
export function DiscardChangesDialog({ onKeepEditing, onDiscard }: Readonly<DiscardChangesDialogProps>) {
  return (
    <div className="mhn-discard-modal-overlay">
      <div className="mhn-discard-modal-card">
        <h3 className="mhn-discard-title">Discard Unsaved Changes?</h3>
        <p className="mhn-discard-sub">
          You have unsaved edits in your profile. Are you sure you want to discard them?
        </p>
        <div className="mhn-delete-modal-actions">
          <Button onClick={onKeepEditing} className="mhn-btn-keep-editing">
            Keep Editing
          </Button>
          <Button onClick={onDiscard} className="mhn-btn-discard-confirm">
            Discard
          </Button>
        </div>
      </div>
    </div>
  );
}
