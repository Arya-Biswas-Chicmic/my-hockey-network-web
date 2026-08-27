import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import React from 'react';
import { Spinner } from '@/components/common/Spinner';
import type { AuthMeResponse } from '@my-hockey-network/contracts';
import { X } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useEditProfileForm, type EditProfileFormData } from '@/hooks/use-edit-profile-form';
import { EditProfileIdentitySection } from '@/components/features/profile/EditProfileIdentitySection';
import { EditProfileAthleticSection } from '@/components/features/profile/EditProfileAthleticSection';
import { EditProfileLocationBioSection } from '@/components/features/profile/EditProfileLocationBioSection';
import { DiscardChangesDialog } from '@/components/features/profile/DiscardChangesDialog';

export type { EditProfileFormData };

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: EditProfileFormData) => Promise<AuthMeResponse | void> | void;
  profileData?: Partial<EditProfileFormData> | Record<string, unknown> | null;
}

/**
 * Full profile-editing dialog: read-only account badges, avatar/identity,
 * (for players) athletic details, location/bio, and a discard-changes
 * guard. All form/upload/submit logic lives in `useEditProfileForm`; this
 * component owns layout only.
 */
export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profileData,
}) => {
  const {
    form,
    formData,
    submitProfile,
    cropModal,
    userEmail,
    userPrimaryRole,
    isPlayer,
    isSubmitting,
    isFormDirty,
    isSaveDisabled,
    handleAvatarFileChange,
    handleRemoveAvatar,
    handleAttemptClose,
    showDiscardConfirm,
    setShowDiscardConfirm,
    saveSuccessMsg,
    submissionError,
  } = useEditProfileForm({ isOpen, onClose, onSave, profileData });

  if (!isOpen) return null;

  return (
    <div
      className="mhn-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleAttemptClose();
      }}
    >
      <div className="mhn-edit-profile-dialog-card">
        <div className="mhn-edit-profile-header">
          <div>
            <h2 className="mhn-edit-profile-title">Edit Profile</h2>
            <p className="mhn-edit-profile-sub">
              Update your personal details, player stats, and account preferences.
            </p>
          </div>

          <Button onClick={handleAttemptClose} className="mhn-edit-profile-close-btn" aria-label="Close modal">
            <X size={20} aria-hidden="true" />
          </Button>
        </div>

        <Form methods={form} onSubmit={submitProfile} id="edit-profile-form" className="mhn-edit-profile-form-body" noValidate>
          {saveSuccessMsg && (
            <div className="mhn-resend-notice-card mhn-mb-20">
              <span>✓</span>
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {submissionError && (
            <div className="mhn-edit-profile-field-error mhn-mb-20">{submissionError}</div>
          )}

          <div className="mhn-edit-profile-system-banner">
            <div>
              <div className="mhn-system-field-header">
                <label className="mhn-system-field-label">Email Address</label>
                <span className="mhn-verified-badge-pill">✓ Verified</span>
              </div>
              <Input type="text" value={userEmail} disabled readOnly className="mhn-readonly-input-box" />
            </div>

            <div>
              <div className="mhn-system-field-header">
                <label className="mhn-system-field-label">Primary Account Role</label>
              </div>
              <div className="mhn-readonly-role-box">
                <span className="mhn-blue-role-dot" />
                <span>{userPrimaryRole}</span>
                <span className="mhn-comment-time mhn-ml-auto">(Primary Role Locked)</span>
              </div>
            </div>
          </div>

          <EditProfileIdentitySection
            avatarUrl={formData.avatarUrl}
            onAvatarFileChange={handleAvatarFileChange}
            onRemoveAvatar={handleRemoveAvatar}
          />

          {isPlayer && <EditProfileAthleticSection />}

          <EditProfileLocationBioSection bioLength={(formData.bio ?? '').length} />
        </Form>

        <div className="mhn-edit-profile-footer">
          <span className={`mhn-unsaved-text ${isFormDirty ? 'dirty' : 'clean'}`}>
            {isFormDirty ? '● Unsaved changes' : 'No changes made'}
          </span>

          <div className="mhn-btn-loading-flex">
            <Button type="button" onClick={handleAttemptClose} className="mhn-btn-profile-cancel">
              Cancel
            </Button>

            <Button
              type="submit"
              form="edit-profile-form"
              disabled={isSaveDisabled}
              className={`mhn-btn-profile-save ${isSaveDisabled ? 'disabled' : 'active'}`}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" color="#FFFFFF" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>

      {showDiscardConfirm && (
        <DiscardChangesDialog
          onKeepEditing={() => setShowDiscardConfirm(false)}
          onDiscard={() => {
            setShowDiscardConfirm(false);
            onClose();
          }}
        />
      )}

      {cropModal}
    </div>
  );
};
