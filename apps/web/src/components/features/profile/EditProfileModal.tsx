'use client';

import type { AuthMeResponse } from '@my-hockey-network/contracts';
import type { EditProfileFormValues } from '@my-hockey-network/validation';
import { X } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { Spinner } from '@/components/common/Spinner';
import { DiscardChangesDialog } from '@/components/features/profile/DiscardChangesDialog';
import { FormInput, FormSelect, FormTextarea } from '@/components/form/fields';
import { Form } from '@/components/ui/form';
import { HEIGHT_OPTIONS, POSITION_OPTIONS, SHOOTS_OPTIONS } from '@/config/profile-options';
import { useEditProfileForm, type EditProfileFormData } from '@/hooks/use-edit-profile-form';
import { useReferenceData } from '@/hooks/use-reference-data';

export type { EditProfileFormData };

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: EditProfileFormData) => Promise<AuthMeResponse | void> | void;
  profileData?: Partial<EditProfileFormData> | Record<string, unknown> | null;
}

const fieldClassName = 'h-11 w-full rounded-lg border border-auth-stroke bg-background px-3 text-sm text-foreground outline-none focus:border-primary';
const fieldContainerClassName = 'space-y-1.5';

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profileData,
}) => {
  const profileRecord = (profileData || {}) as Record<string, unknown>;
  const heightDisplay = String(profileRecord.height || '—');
  const weightDisplay = String(profileRecord.weight || '—');
  const { positions } = useReferenceData();
  const {
    form,
    submitProfile,
    userPrimaryRole,
    isPlayer,
    isSubmitting,
    isFormDirty,
    isSaveDisabled,
    handleAttemptClose,
    showDiscardConfirm,
    setShowDiscardConfirm,
    saveSuccessMsg,
    submissionError,
  } = useEditProfileForm({ isOpen, onClose, onSave, profileData });

  if (!isOpen) return null;

  return (
    <div className="mhn-modal-overlay" onClick={(event) => event.target === event.currentTarget && handleAttemptClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="flex max-h-[90vh] w-full max-w-[527px] flex-col overflow-hidden rounded-xl border border-auth-stroke bg-auth-field text-foreground shadow-2xl">
        <header className="flex items-center justify-between border-b border-auth-stroke px-6 py-5">
          <h2 id="edit-profile-title" className="text-xl font-bold">Edit Profile</h2>
          <Button onClick={handleAttemptClose} className="grid size-8 place-items-center rounded-full border border-auth-stroke text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close edit profile"><X size={18} /></Button>
        </header>

        <Form methods={form} onSubmit={submitProfile} id="edit-profile-form" className="flex-1 space-y-5 overflow-y-auto px-6 py-5" noValidate>
          {saveSuccessMsg ? <p role="status" className="rounded-lg border border-success-border bg-success-surface p-3 text-sm text-success-foreground">{saveSuccessMsg}</p> : null}
          {submissionError ? <p role="alert" className="rounded-lg border border-destructive-border bg-destructive-surface p-3 text-sm text-destructive">{submissionError}</p> : null}

          <FormInput<EditProfileFormValues, 'displayName'> name="displayName" label="Name" required maxLength={50} inputClassName={fieldClassName} containerClassName={fieldContainerClassName} errorClassName="text-xs text-destructive" isNameInput />
          <FormTextarea<EditProfileFormValues, 'bio'> name="bio" label="Bio" rows={3} textareaClassName={`${fieldClassName} min-h-24 py-3`} containerClassName={fieldContainerClassName} errorClassName="text-xs text-destructive" />

          <div className={fieldContainerClassName}><label className="auth-label" htmlFor="profile-role">Role</label><Input id="profile-role" value={userPrimaryRole} readOnly disabled className={`${fieldClassName} cursor-not-allowed opacity-70`} /></div>
          <FormInput<EditProfileFormValues, 'dateOfBirth'> name="dateOfBirth" label="Date of Birth" type="date" inputClassName={fieldClassName} containerClassName={fieldContainerClassName} errorClassName="text-xs text-destructive" />

          {isPlayer ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <FormSelect<EditProfileFormValues, 'height'>
                  name="height"
                  label="Height"
                  options={[...HEIGHT_OPTIONS]}
                  selectClassName={fieldClassName}
                  containerClassName={fieldContainerClassName}
                  errorClassName="text-xs text-destructive"
                />
                <div className={fieldContainerClassName}>
                  <label className="auth-label" htmlFor="profile-weight">Weight</label>
                  <Input
                    id="profile-weight"
                    value={weightDisplay}
                    readOnly
                    disabled
                    className={`${fieldClassName} cursor-not-allowed opacity-70`}
                  />
                </div>
              </div>
              <FormSelect<EditProfileFormValues, 'position'> name="position" label="Position" options={positions.length ? positions : [...POSITION_OPTIONS]} selectClassName={fieldClassName} containerClassName={fieldContainerClassName} errorClassName="text-xs text-destructive" />
              <FormSelect<EditProfileFormValues, 'shootsCatches'> name="shootsCatches" label="Shoots / Catches" options={SHOOTS_OPTIONS} selectClassName={fieldClassName} containerClassName={fieldContainerClassName} errorClassName="text-xs text-destructive" />
              <FormInput<EditProfileFormValues, 'jerseyNumber'> name="jerseyNumber" label="Jersey Number" type="number" min="0" max="99" inputClassName={fieldClassName} containerClassName={fieldContainerClassName} errorClassName="text-xs text-destructive" disableAutoSanitize />
            </>
          ) : null}
          <FormInput<EditProfileFormValues, 'city'> name="city" label="City / Location" maxLength={50} inputClassName={fieldClassName} containerClassName={fieldContainerClassName} errorClassName="text-xs text-destructive" disableAutoSanitize />
        </Form>

        <footer className="flex items-center justify-between gap-3 border-t border-auth-stroke px-6 py-4">
          <span className="text-xs text-muted-foreground">{isFormDirty ? 'Unsaved changes' : 'No changes made'}</span>
          <div className="flex gap-2"><Button variant="solid-outline" onClick={handleAttemptClose} className="h-10 py-0">Cancel</Button><Button variant="solid" type="submit" form="edit-profile-form" disabled={isSaveDisabled} className="h-10 min-w-28 py-0">{isSubmitting ? <><Spinner size="sm" /><span>Saving…</span></> : 'Save Changes'}</Button></div>
        </footer>
      </div>

      {showDiscardConfirm ? <DiscardChangesDialog onKeepEditing={() => setShowDiscardConfirm(false)} onDiscard={() => { setShowDiscardConfirm(false); onClose(); }} /> : null}
    </div>
  );
};
