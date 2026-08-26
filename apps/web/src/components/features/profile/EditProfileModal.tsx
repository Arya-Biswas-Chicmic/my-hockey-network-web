import { Button } from '@/components/common/Button';
import { Input, Select, Textarea, Dropdown } from '@/components/common/FormControls';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/common/Spinner';
import { uploadMediaFile } from '@my-hockey-network/core';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import type { AuthMeResponse } from '@my-hockey-network/contracts';
import { X } from 'lucide-react';
import { QueryKeys } from '@my-hockey-network/contracts';
import { validateProfileField } from '@my-hockey-network/validation';
import { globalQueryClient } from '@/query';
import { useReferenceData } from '@/hooks/use-reference-data';
import { useFormik, type FormikErrors } from 'formik';

export interface EditProfileFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  city: string;
  dateOfBirth: string;
  position: string;
  shootsCatches: string;
  jerseyNumber: string;
  genderCategory: string;
  preferredLanguage: string;
  defaultVisibility: string;
  avatarUrl: string;
  avatarKey?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: EditProfileFormData) => Promise<AuthMeResponse | void> | void;
  profileData?: Partial<EditProfileFormData> | Record<string, unknown> | null;
}

const POSITION_OPTIONS = [
  { value: 'Center', label: 'Center (C)' },
  { value: 'Left Wing', label: 'Left Wing (LW)' },
  { value: 'Right Wing', label: 'Right Wing (RW)' },
  { value: 'Defense', label: 'Defense (D)' },
  { value: 'Goaltender', label: 'Goaltender (G)' },
];

const SHOOTS_OPTIONS = [
  { value: 'Left', label: 'Left' },
  { value: 'Right', label: 'Right' },
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'nl', label: 'Dutch (Nederlands)' },
  { value: 'sv', label: 'Swedish (Svenska)' },
];

const VISIBILITY_OPTIONS = [
  { value: 'EVERYONE', label: 'Everyone (Public)' },
  { value: 'CONNECTIONS', label: 'Connections Only' },
  { value: 'PRIVATE', label: 'Private (Only Me)' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profileData,
}) => {
  const { user } = useAuth();
  const { positions: refPositions } = useReferenceData();
  const positionOptions = refPositions.length ? refPositions : POSITION_OPTIONS;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarPreviewUrlRef = useRef<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

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
    if (avatarPreviewUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewUrlRef.current);
      avatarPreviewUrlRef.current = null;
    }
  }, []);

  const formik = useFormik<EditProfileFormData>({
    initialValues: extractProfileValues(profileData || user),
    validate: (values) => {
      const validationErrors: FormikErrors<EditProfileFormData> = {};
      (Object.keys(values) as Array<keyof EditProfileFormData>).forEach((key) => {
        const error = validateProfileField(key, values[key] ?? '');
        if (error) validationErrors[key] = error;
      });
      return validationErrors;
    },
    onSubmit: async (values, helpers) => {
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
        helpers.resetForm({ values: freshData });
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
    },
  });

  const { resetForm } = formik;

  useEffect(() => {
    if (isOpen) {
      resetForm({ values: extractProfileValues(profileData || user) });
    }
  }, [isOpen, profileData, user, extractProfileValues, resetForm]);

  useEffect(() => revokeAvatarPreview, [revokeAvatarPreview]);

  // Sync form data whenever modal opens or user object updates
  useEffect(() => {
    if (isOpen) {
      const init = extractProfileValues();
      formik.resetForm({ values: init });
      setSubmissionError(null);
      setSaveSuccessMsg(null);
      setShowDiscardConfirm(false);
      setSelectedAvatarFile(null);
      revokeAvatarPreview();
    }
  }, [isOpen, user, extractProfileValues, revokeAvatarPreview]); // Formik is intentionally reset only when the modal input changes.

  if (!isOpen) return null;

  const userEmail = user?.email || '';
  const userPrimaryRole = user?.primaryRole || user?.profile?.type || 'PLAYER';
  const isPlayer = userPrimaryRole.toUpperCase() === 'PLAYER';

  // Compute dirty state
  const { values: formData, errors, isSubmitting } = formik;
  const isFormDirty = formik.dirty || !!selectedAvatarFile;

  const handleChange = (field: keyof EditProfileFormData, value: string) => {
    void formik.setFieldValue(field, value, true);
    setSubmissionError(null);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate MIME type as per media-uploads.md: jpeg, png, webp (max 10MB)
      const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validMimeTypes.includes(file.type.toLowerCase())) {
        setSubmissionError('Unsupported image format. Please select a JPG, PNG, or WebP photo (HEIC/SVG/GIF not supported).');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setSubmissionError('File size exceeds 10 MB limit. Please select a smaller photo.');
        return;
      }

      setSelectedAvatarFile(file);
      revokeAvatarPreview();
      const previewUrl = URL.createObjectURL(file);
      avatarPreviewUrlRef.current = previewUrl;
      handleChange('avatarUrl', previewUrl);
    }
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
        <form onSubmit={formik.handleSubmit} className="mhn-edit-profile-form-body" noValidate>
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
                <img
                  src={formData.avatarUrl}
                  alt="Profile Avatar"
                  className="mhn-avatar-preview-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                  }}
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mhn-avatar-pencil-badge"
                  title="Upload profile photo"
                >
                  ✎
                </Button>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="mhn-display-none"
                />
              </div>

              <div>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mhn-btn-upload-photo"
                >
                  Upload Photo
                </Button>
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
              <div>
                <label className="mhn-form-label-block">
                  Display Name <span className="mhn-red-star">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  maxLength={50}
                  placeholder="e.g. Saksham Garg"
                  className={`mhn-edit-profile-input ${errors.displayName ? 'mhn-input-invalid' : ''}`}
                />
                {errors.displayName && (
                  <span className="mhn-edit-profile-field-error">
                    <span>{errors.displayName}</span>
                  </span>
                )}
              </div>

              <div>
                <label className="mhn-form-label-block">
                  First Name
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  maxLength={50}
                  placeholder="e.g. Saksham"
                  className={`mhn-edit-profile-input ${errors.firstName ? 'mhn-input-invalid' : ''}`}
                />
                {errors.firstName && (
                  <span className="mhn-edit-profile-field-error">
                    <span>{errors.firstName}</span>
                  </span>
                )}
              </div>

              <div>
                <label className="mhn-form-label-block">
                  Last Name
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  maxLength={50}
                  placeholder="e.g. Garg"
                  className={`mhn-edit-profile-input ${errors.lastName ? 'mhn-input-invalid' : ''}`}
                />
                {errors.lastName && (
                  <span className="mhn-edit-profile-field-error">
                    <span>{errors.lastName}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Date of Birth & Gender Grid */}
            <div className="mhn-edit-profile-system-banner mhn-mt-16">
              <div>
                <label className="mhn-form-label-block">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className={`mhn-edit-profile-input ${errors.dateOfBirth ? 'mhn-input-invalid' : ''}`}
                />
                {errors.dateOfBirth && (
                  <span className="mhn-edit-profile-field-error">
                    <span>{errors.dateOfBirth}</span>
                  </span>
                )}
              </div>

              <Dropdown
                label="Gender Category"
                value={formData.genderCategory}
                options={GENDER_OPTIONS}
                onChange={(val) => handleChange('genderCategory', val)}
                placeholder="Select gender"
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
                <Dropdown
                  label="Position"
                  value={formData.position}
                  options={positionOptions}
                  onChange={(val) => handleChange('position', val)}
                  placeholder="Select position"
                />

                <Dropdown
                  label="Shoots / Catches"
                  value={formData.shootsCatches}
                  options={SHOOTS_OPTIONS}
                  onChange={(val) => handleChange('shootsCatches', val)}
                  placeholder="Select option"
                />

                <div>
                  <label className="mhn-form-label-block">
                    Jersey Number (#)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.jerseyNumber}
                    onChange={(e) => handleChange('jerseyNumber', e.target.value)}
                    placeholder="e.g. 97"
                    className={`mhn-edit-profile-input ${errors.jerseyNumber ? 'mhn-input-invalid' : ''}`}
                  />
                  {errors.jerseyNumber && (
                    <span className="mhn-edit-profile-field-error">
                      <span>{errors.jerseyNumber}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location & Bio Section */}
          <div className="mhn-mb-24">
            <div className="mhn-mt-16">
              <label className="mhn-form-label-block">
                City / Location
              </label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                maxLength={50}
                placeholder="e.g. Toronto, ON or Austria, Europe"
                className={`mhn-edit-profile-input ${errors.city ? 'mhn-input-invalid' : ''}`}
              />
              {errors.city && (
                <span className="mhn-edit-profile-field-error">
                  <span>{errors.city}</span>
                </span>
              )}
            </div>

            <div className="mhn-mt-16">
              <label className="mhn-form-label-block">
                Player Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Write a brief intro about your hockey background and goals..."
                rows={3}
                className={`mhn-edit-profile-input mhn-bio-textarea ${errors.bio ? 'mhn-input-invalid' : ''}`}
              />
              <div className="mhn-toggle-row-between">
                <div>
                  {errors.bio && (
                    <span className="mhn-edit-profile-field-error">
                      <span>{errors.bio}</span>
                    </span>
                  )}
                </div>
                <span className="mhn-edit-profile-char-count">
                  {formData.bio.length} / 300
                </span>
              </div>
            </div>
          </div>
        </form>

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
              type="button"
              onClick={() => void formik.submitForm()}
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
    </div>
  );
};
