import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/common/Spinner';
import { uploadMediaFile } from '@my-hockey-network/core';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import type { AuthMeResponse } from '@my-hockey-network/contracts';
import { X } from 'lucide-react';
import { QueryKeys } from '@my-hockey-network/contracts';
import { createFileSchema, editProfileFormSchema, IMAGE_ACCEPT, IMAGE_MIME_TYPES, type EditProfileFormValues } from '@my-hockey-network/validation';
import { globalQueryClient } from '@/query';
import { useReferenceData } from '@/hooks/use-reference-data';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { FilePickerButton } from '@/components/ui/file-picker-button';
import { useImageCrop } from '@/hooks/use-image-crop';
import { FormInput, FormSelect, FormTextarea } from '@/components/form/fields';
import { GENDER_OPTIONS, POSITION_OPTIONS, SHOOTS_OPTIONS } from '@/config/profile-options';

export interface EditProfileFormData extends EditProfileFormValues {
  avatarKey?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: EditProfileFormData) => Promise<AuthMeResponse | void> | void;
  profileData?: Partial<EditProfileFormData> | Record<string, unknown> | null;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profileData,
}) => {
  const { user } = useAuth();
  const { positions: refPositions } = useReferenceData();
  const positionOptions = refPositions.length ? refPositions : POSITION_OPTIONS;
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const { cropImage, cropModal } = useImageCrop();

  const extractProfileValues = useCallback(
    (customObj?: Record<string, unknown> | AuthMeResponse | null): EditProfileFormData => {
      const p = customObj && typeof customObj === 'object' && 'profile' in customObj
        ? (customObj as AuthMeResponse).profile
        : (customObj as Record<string, unknown> | null);
      const prof = p || user?.profile || {};
      const profRecord = (prof || {}) as Record<string, unknown>;
      let dobFormatted = '';
      const rawDob = profRecord.dateOfBirth || profRecord.dob;
      if (rawDob) {
        try {
          const str = String(rawDob);
          dobFormatted = str.includes('T') ? str.split('T')[0] : str;
        } catch {
          dobFormatted = String(rawDob);
        }
      }

      return {
        firstName: String(profRecord.firstName || ''),
        lastName: String(profRecord.lastName || ''),
        displayName: String(profRecord.displayName || profRecord.name || ''),
        bio: String(profRecord.bio || ''),
        city: String(profRecord.city || profRecord.location || ''),
        dateOfBirth: dobFormatted,
        position: String(profRecord.position || 'Center'),
        shootsCatches: String(profRecord.shootsCatches || profRecord.shoots || 'Left'),
        jerseyNumber: profRecord.jerseyNumber !== null && profRecord.jerseyNumber !== undefined ? String(profRecord.jerseyNumber) : '',
        genderCategory: String(profRecord.genderCategory || profRecord.gender || 'Male'),
        preferredLanguage: String(profRecord.preferredLanguage || 'en'),
        defaultVisibility: String(profRecord.defaultVisibility || 'CONNECTIONS'),
        avatarUrl: resolveMediaUrl(profRecord.avatarUrl as string | undefined, '/userPlaceholder.png'),
      };
    },
    [user]
  );

  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const revokeAvatarPreview = useCallback(() => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
    }
  }, [avatarPreviewUrl]);

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    mode: 'onChange',
    defaultValues: extractProfileValues(profileData || user),
  });
  const formData = useWatch({ control: form.control });
  const submitProfile = form.handleSubmit(async (values) => {
      setSubmissionError(null);
      let uploadedAvatarKey: string | undefined;

      if (selectedAvatarFile) {
        try {
          const uploadResponse = await uploadMediaFile(selectedAvatarFile, 'AVATAR');
          uploadedAvatarKey = uploadResponse.storageKey;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to upload photo to storage. Please try again.';
          setSubmissionError(message);
          return;
        }
      }

      try {
        const apiResponse = await onSave?.({ ...values, avatarKey: uploadedAvatarKey });
        let freshData: EditProfileFormData;

        if (apiResponse?.profile) {
          globalQueryClient.setQueryData([QueryKeys.AUTH_ME], apiResponse);
          freshData = extractProfileValues(apiResponse);
        } else {
          void globalQueryClient.invalidateQueries({ queryKey: [QueryKeys.AUTH_ME] });
          freshData = extractProfileValues(profileData || user);
        }

        void globalQueryClient.invalidateQueries({ queryKey: [QueryKeys.USER_PROFILE] });
        form.reset(freshData);
        setSaveSuccessMsg('Profile updated successfully!');
        revokeAvatarPreview();
        setSelectedAvatarFile(null);
        window.setTimeout(() => {
          setSaveSuccessMsg(null);
          onClose();
        }, 1200);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
        setSubmissionError(message);
      }
  });

  useEffect(() => revokeAvatarPreview, [revokeAvatarPreview]);

  // Sync form data whenever modal opens or user object updates
  useEffect(() => {
    if (isOpen) {
      const init = extractProfileValues();
      form.reset(init);
      setSubmissionError(null);
      setSaveSuccessMsg(null);
      setShowDiscardConfirm(false);
      setSelectedAvatarFile(null);
      revokeAvatarPreview();
    }
  }, [form, isOpen, user, extractProfileValues, revokeAvatarPreview]);

  if (!isOpen) return null;

  const userEmail = user?.email || '';
  const userPrimaryRole = user?.primaryRole || user?.profile?.type || 'PLAYER';
  const isPlayer = userPrimaryRole.toUpperCase() === 'PLAYER';

  // Compute dirty state
  const { errors, isSubmitting, isDirty } = form.formState;
  const isFormDirty = isDirty || !!selectedAvatarFile;

  const handleChange = (field: keyof EditProfileFormValues, value: string) => {
    form.setValue(field, value, { shouldDirty: true, shouldValidate: true });
    setSubmissionError(null);
  };

  const handleAvatarFileChange = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const result = createFileSchema({ acceptedTypes: IMAGE_MIME_TYPES, maxBytes: 10 * 1024 * 1024 }).safeParse(file);
    if (!result.success) {
      setSubmissionError(result.error.issues[0]?.message ?? 'Select a JPG, PNG, or WebP photo up to 10 MB.');
      return;
    }

    const cropped = await cropImage(file, { shape: 'circle', title: 'Adjust profile photo' });
    if (!cropped) return;

    setSelectedAvatarFile(cropped);
    revokeAvatarPreview();
    const previewUrl = URL.createObjectURL(cropped);
    setAvatarPreviewUrl(previewUrl);
    handleChange('avatarUrl', previewUrl);
  };

  const handleAttemptClose = () => {
    if (isFormDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const hasValidationErrors = Object.keys(errors).length > 0;
  const isSaveDisabled = !isFormDirty || hasValidationErrors || isSubmitting;

  return (
    <div
      className="mhn-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleAttemptClose();
      }}
    >
      <div
        className="mhn-edit-profile-dialog-card"
      >
        {/* Modal Header */}
        <div
          className="mhn-edit-profile-header"
        >
          <div>
            <h2 className="mhn-edit-profile-title">
              Edit Profile
            </h2>
            <p className="mhn-edit-profile-sub">
              Update your personal details, player stats, and account preferences.
            </p>
          </div>

          <Button
            onClick={handleAttemptClose}
            className="mhn-edit-profile-close-btn"
            aria-label="Close modal"
          >
            <X size={20} aria-hidden="true" />
          </Button>
        </div>

        {/* Modal Scrollable Form Body */}
        <Form methods={form} onSubmit={submitProfile} id="edit-profile-form" className="mhn-edit-profile-form-body" noValidate>
          {saveSuccessMsg && (
            <div
              className="mhn-resend-notice-card mhn-mb-20"
            >
              <span>✓</span>
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {submissionError && (
            <div
              className="mhn-edit-profile-field-error mhn-mb-20"
            >
              {submissionError}
            </div>
          )}

          {/* Section 1: Read-Only System Account Badges */}
          <div
            className="mhn-edit-profile-system-banner"
          >
            {/* Email (Read-only + Verified Badge) */}
            <div>
              <div className="mhn-system-field-header">
                <label className="mhn-system-field-label">
                  Email Address
                </label>
                <span className="mhn-verified-badge-pill">
                  ✓ Verified
                </span>
              </div>
              <Input
                type="text"
                value={userEmail}
                disabled
                readOnly
                className="mhn-readonly-input-box"
              />
            </div>

            {/* Primary Role (Read-only PLAYER Badge) */}
            <div>
              <div className="mhn-system-field-header">
                <label className="mhn-system-field-label">
                  Primary Account Role
                </label>
              </div>
              <div className="mhn-readonly-role-box">
                <span className="mhn-blue-role-dot" />
                <span>{userPrimaryRole}</span>
                <span className="mhn-comment-time mhn-ml-auto">(Primary Role Locked)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Avatar Upload & Identity */}
          <div className="mhn-mb-24">
            <h3 className="mhn-section-heading">
              Personal Identity
            </h3>

            {/* Avatar Row */}
            <div className="mhn-avatar-edit-row">
              <div className="mhn-relative-container">
                {/* `avatarUrl` may hold a local object: URL preview (selected but not yet
                    uploaded) as well as a remote hosted URL — not a Next-optimizable
                    remote asset in the preview case, so this stays a plain <img>. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.avatarUrl}
                  alt="Profile Avatar"
                  className="mhn-avatar-preview-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                  }}
                />
                <FilePickerButton
                  accept={IMAGE_ACCEPT}
                  onFilesSelected={handleAvatarFileChange}
                  buttonProps={{ className: 'mhn-avatar-pencil-badge', title: 'Upload profile photo', 'aria-label': 'Upload profile photo' }}
                >
                  ✎
                </FilePickerButton>
              </div>

              <div>
                <FilePickerButton
                  accept={IMAGE_ACCEPT}
                  onFilesSelected={handleAvatarFileChange}
                  buttonProps={{ className: 'mhn-btn-upload-photo' }}
                >
                  Upload Photo
                </FilePickerButton>
                {formData.avatarUrl !== '/userPlaceholder.png' && (
                  <Button
                    type="button"
                    onClick={() => {
                      revokeAvatarPreview();
                      setSelectedAvatarFile(null);
                      handleChange('avatarUrl', '/userPlaceholder.png');
                    }}
                    className="mhn-btn-remove-photo"
                  >
                    Remove
                  </Button>
                )}
                <p className="mhn-parent-card-sub-sm mhn-mt-6">
                  Allowed JPG, PNG or WebP. Max 10MB.
                </p>
              </div>
            </div>

            {/* Display Name, First Name, Last Name Grid */}
            <div className="mhn-edit-profile-system-banner">
              <FormInput<EditProfileFormValues, 'displayName'> name="displayName" label="Display Name" required maxLength={50} placeholder="e.g. Saksham Garg" inputClassName="mhn-edit-profile-input" containerClassName="" errorClassName="mhn-edit-profile-field-error" isNameInput />
              <FormInput<EditProfileFormValues, 'firstName'> name="firstName" label="First Name" maxLength={50} placeholder="e.g. Saksham" inputClassName="mhn-edit-profile-input" containerClassName="" errorClassName="mhn-edit-profile-field-error" isNameInput />
              <FormInput<EditProfileFormValues, 'lastName'> name="lastName" label="Last Name" maxLength={50} placeholder="e.g. Garg" inputClassName="mhn-edit-profile-input" containerClassName="" errorClassName="mhn-edit-profile-field-error" isNameInput />
            </div>

            {/* Date of Birth & Gender Grid */}
            <div className="mhn-edit-profile-system-banner mhn-mt-16">
              <FormInput<EditProfileFormValues, 'dateOfBirth'> name="dateOfBirth" label="Date of Birth" type="date" inputClassName="mhn-edit-profile-input" containerClassName="" errorClassName="mhn-edit-profile-field-error" />

              <FormSelect<EditProfileFormValues, 'genderCategory'>
                name="genderCategory"
                label="Gender Category"
                options={GENDER_OPTIONS}
                selectClassName="mhn-edit-profile-input"
                containerClassName=""
              />
            </div>
          </div>

          {/* Section 3: Player Athletic & Hockey Details (Only for Players) */}
          {isPlayer && (
            <div className="mhn-mb-24">
              <h3 className="mhn-section-heading">
                Player & Athletic Information
              </h3>

              <div className="mhn-edit-profile-system-banner">
                <FormSelect<EditProfileFormValues, 'position'>
                  name="position"
                  label="Position"
                  options={[...positionOptions]}
                  selectClassName="mhn-edit-profile-input"
                  containerClassName=""
                />

                <FormSelect<EditProfileFormValues, 'shootsCatches'>
                  name="shootsCatches"
                  label="Shoots / Catches"
                  options={SHOOTS_OPTIONS}
                  selectClassName="mhn-edit-profile-input"
                  containerClassName=""
                />

                <FormInput<EditProfileFormValues, 'jerseyNumber'> name="jerseyNumber" label="Jersey Number (#)" type="number" min="0" max="99" placeholder="e.g. 97" inputClassName="mhn-edit-profile-input" containerClassName="" errorClassName="mhn-edit-profile-field-error" disableAutoSanitize />
              </div>
            </div>
          )}

          {/* Location & Bio Section */}
          <div className="mhn-mb-24">
            <FormInput<EditProfileFormValues, 'city'> name="city" label="City / Location" maxLength={50} placeholder="e.g. Toronto, ON or Austria, Europe" inputClassName="mhn-edit-profile-input" containerClassName="mhn-mt-16" errorClassName="mhn-edit-profile-field-error" disableAutoSanitize />

            <div className="mhn-mt-16">
              <FormTextarea<EditProfileFormValues, 'bio'>
                name="bio"
                label="Player Bio"
                placeholder="Write a brief intro about your hockey background and goals..."
                rows={3}
                textareaClassName="mhn-edit-profile-input mhn-bio-textarea"
                errorClassName="mhn-edit-profile-field-error"
              />
              <div className="mhn-toggle-row-between">
                <div />
                <span className="mhn-edit-profile-char-count">
                  {(formData.bio ?? '').length} / 300
                </span>
              </div>
            </div>
          </div>
        </Form>

        {/* Modal Footer Actions */}
        <div
          className="mhn-edit-profile-footer"
        >
          <span className={`mhn-unsaved-text ${isFormDirty ? 'dirty' : 'clean'}`}>
            {isFormDirty ? '● Unsaved changes' : 'No changes made'}
          </span>

          <div className="mhn-btn-loading-flex">
            <Button
              type="button"
              onClick={handleAttemptClose}
              className="mhn-btn-profile-cancel"
            >
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

      {/* Discard Unsaved Changes Dialog */}
      {showDiscardConfirm && (
        <div
          className="mhn-discard-modal-overlay"
        >
          <div
            className="mhn-discard-modal-card"
          >
            <h3 className="mhn-discard-title">
              Discard Unsaved Changes?
            </h3>
            <p className="mhn-discard-sub">
              You have unsaved edits in your profile. Are you sure you want to discard them?
            </p>
            <div className="mhn-delete-modal-actions">
              <Button
                onClick={() => setShowDiscardConfirm(false)}
                className="mhn-btn-keep-editing"
              >
                Keep Editing
              </Button>
              <Button
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
                className="mhn-btn-discard-confirm"
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}

      {cropModal}
    </div>
  );
};
