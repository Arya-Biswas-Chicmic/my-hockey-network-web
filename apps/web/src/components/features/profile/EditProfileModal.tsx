import { Button } from '@/components/common/Button';
import { Input, Textarea, Dropdown } from '@/components/common/FormControls';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Formik, Form, Field } from 'formik';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/common/Spinner';
import { FormikInput } from '@/components/common/form/FormikInput';
import { FormError } from '@/components/common/form/FormError';
import { uploadMediaFile } from '@my-hockey-network/core';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import type { AuthMeResponse } from '@my-hockey-network/contracts';
import { QueryKeys, UserRoleEnum } from '@my-hockey-network/contracts';
import { editProfileSchema, EditProfileFormValues } from '@my-hockey-network/validation';
import { globalQueryClient } from '@/query';
import { useReferenceData } from '@/hooks/use-reference-data';

export interface EditProfileFormData extends EditProfileFormValues {
  shootsCatches: string;
  preferredLanguage: string;
  defaultVisibility: string;
  avatarUrl: string;
  avatarKey?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: EditProfileFormData) => Promise<AuthMeResponse | void> | void;
}

const POSITION_OPTIONS = [
  { value: 'Center', label: 'Center (C)' },
  { value: 'Left Wing', label: 'Left Wing (LW)' },
  { value: 'Right Wing', label: 'Right Wing (RW)' },
  { value: 'Defense', label: 'Defense (D)' },
  { value: 'Goaltender', label: 'Goaltender (G)' },
];

const SHOOTS_OPTIONS = [
  { value: 'Left', label: 'Left (L)' },
  { value: 'Right', label: 'Right (R)' },
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-Binary', label: 'Non-Binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const { positions: refPositions } = useReferenceData();
  const positionOptions = refPositions.length ? refPositions : POSITION_OPTIONS;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

  const extractProfileValues = useCallback(
    (userObj?: AuthMeResponse | null): EditProfileFormData => {
      const prof = userObj?.profile || user?.profile;
      let dobFormatted = '';
      if (prof?.dateOfBirth) {
        try {
          const str = String(prof.dateOfBirth);
          dobFormatted = str.includes('T') ? str.split('T')[0] : str;
        } catch {
          dobFormatted = String(prof.dateOfBirth);
        }
      }

      return {
        firstName: prof?.firstName ?? '',
        lastName: prof?.lastName ?? '',
        displayName: prof?.displayName ?? (userObj as any)?.displayName ?? (user as any)?.displayName ?? '',
        bio: prof?.bio ?? '',
        city: prof?.city ?? '',
        dateOfBirth: dobFormatted,
        position: prof?.position ?? 'Center',
        shootsCatches: prof?.shootsCatches ?? 'Left',
        jerseyNumber: prof?.jerseyNumber !== null && prof?.jerseyNumber !== undefined ? String(prof.jerseyNumber) : '',
        genderCategory: prof?.genderCategory ?? 'Male',
        preferredLanguage: prof?.preferredLanguage ?? 'en',
        defaultVisibility: prof?.defaultVisibility ?? 'CONNECTIONS',
        avatarUrl: resolveMediaUrl(prof?.avatarUrl, '/userPlaceholder.png'),
      };
    },
    [user]
  );

  const [initialForm, setInitialForm] = useState<EditProfileFormData>(() => extractProfileValues());
  const [apiError, setApiError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const init = extractProfileValues();
      setInitialForm(init);
      setApiError(null);
      setSaveSuccessMsg(null);
      setShowDiscardConfirm(false);
      setSelectedAvatarFile(null);
    }
  }, [isOpen, user, extractProfileValues]);

  if (!isOpen) return null;

  const userEmail =
    (user as any)?.email ||
    (user as any)?.user?.email ||
    (user?.profile as any)?.email ||
    (user as any)?.contactEmail ||
    (user as any)?.about?.email ||
    '';
  const userPrimaryRole = user?.primaryRole || user?.profile?.type || UserRoleEnum.PLAYER;
  const isPlayer = userPrimaryRole.toUpperCase() === UserRoleEnum.PLAYER;

  const handleAttemptClose = (dirty: boolean) => {
    if (dirty || selectedAvatarFile) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleFormSubmit = async (values: EditProfileFormData) => {
    setApiError(null);

    let uploadedAvatarKey: string | undefined = undefined;

    if (selectedAvatarFile) {
      try {
        const uploadRes = await uploadMediaFile(selectedAvatarFile, 'AVATAR');
        uploadedAvatarKey = uploadRes.storageKey;
      } catch (uploadErr: any) {
        console.error('❌ [EditProfileModal] Avatar Storage Upload Failed:', uploadErr);
        setApiError(uploadErr.message || 'Failed to upload photo to storage. Please try again.');
        return;
      }
    }

    try {
      if (onSave) {
        const apiResponse = await onSave({
          ...values,
          avatarKey: uploadedAvatarKey,
        });

        if (apiResponse && (apiResponse as AuthMeResponse).profile) {
          globalQueryClient.setQueryData(QueryKeys.AUTH_ME, apiResponse);
          globalQueryClient.invalidateQueries(QueryKeys.USER_PROFILE);
          setInitialForm(extractProfileValues(apiResponse as AuthMeResponse));
        } else {
          globalQueryClient.invalidateQueries(QueryKeys.AUTH_ME);
          globalQueryClient.invalidateQueries(QueryKeys.USER_PROFILE);
          setInitialForm(extractProfileValues(user));
        }
      }
      setSaveSuccessMsg('Profile updated successfully!');
      setSelectedAvatarFile(null);
      setTimeout(() => {
        setSaveSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setApiError(err.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <div
      className="mhn-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleAttemptClose(false);
      }}
    >
      <Formik<EditProfileFormData>
        initialValues={initialForm}
        enableReinitialize
        validationSchema={editProfileSchema}
        onSubmit={handleFormSubmit}
        validateOnBlur
        validateOnChange
      >
        {({ values, handleChange, setFieldValue, dirty, isSubmitting, isValid }) => {
          const isFormDirty = dirty || Boolean(selectedAvatarFile);

          const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
              const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
              if (!validMimeTypes.includes(file.type.toLowerCase())) {
                setApiError('Unsupported image format. Please select a JPG, PNG, or WebP photo.');
                return;
              }
              if (file.size > 10 * 1024 * 1024) {
                setApiError('File size exceeds 10 MB limit. Please select a smaller photo.');
                return;
              }
              setSelectedAvatarFile(file);
              const previewUrl = URL.createObjectURL(file);
              setFieldValue('avatarUrl', previewUrl);
            }
          };

          return (
            <div className="mhn-edit-profile-dialog-card">
              {/* Modal Header */}
              <div className="mhn-edit-profile-header">
                <div>
                  <h2 className="mhn-edit-profile-title">Edit Profile</h2>
                  <p className="mhn-edit-profile-sub">
                    Update your personal details, player stats, and account preferences.
                  </p>
                </div>

                <Button
                  onClick={() => handleAttemptClose(isFormDirty)}
                  className="mhn-edit-profile-close-btn"
                  aria-label="Close modal"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Button>
              </div>

              {/* Modal Form Body */}
              <Form className="mhn-edit-profile-form-body">
                {saveSuccessMsg && (
                  <div className="mhn-resend-notice-card mhn-mb-20">
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {apiError && (
                  <FormError message={apiError} className="mhn-edit-profile-field-error mhn-mb-20" />
                )}

                {/* Section 1: System Account Badges */}
                <div className="mhn-edit-profile-system-banner">
                  <div>
                    <div className="mhn-toggle-row-between mhn-mb-6">
                      <label className="mhn-system-field-label">Email Address</label>
                      <span className="mhn-verified-badge-pill">Verified</span>
                    </div>
                    <Input
                      type="text"
                      value={userEmail}
                      disabled
                      readOnly
                      className="mhn-readonly-input-box"
                    />
                  </div>

                  <div>
                    <label className="mhn-system-field-label mhn-display-block">Primary Account Role</label>
                    <div className="mhn-readonly-role-box">
                      <span className="mhn-blue-role-dot" />
                      <span>{userPrimaryRole}</span>
                      <span className="mhn-comment-time mhn-ml-auto">(Primary Role Locked)</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Avatar Upload & Identity */}
                <div className="mhn-mb-24">
                  <h3 className="mhn-section-heading">Personal Identity</h3>

                  <div className="mhn-avatar-edit-row">
                    <div className="mhn-relative-container">
                      <img
                        src={values.avatarUrl}
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
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
                      {values.avatarUrl !== '/userPlaceholder.png' && (
                        <Button
                          type="button"
                          onClick={() => setFieldValue('avatarUrl', '/userPlaceholder.png')}
                          className="mhn-btn-remove-photo"
                        >
                          Remove
                        </Button>
                      )}
                      <p className="mhn-parent-card-sub-sm mhn-mt-6">
                        Allowed JPG, PNG or WebP. Max 5MB.
                      </p>
                    </div>
                  </div>

                  <div className="mhn-edit-profile-system-banner">
                    <FormikInput
                      name="displayName"
                      label="Display Name"
                      required
                      placeholder="e.g. Saksham Garg"
                      maxLength={50}
                      inputClassName="mhn-edit-profile-input"
                    />

                    <FormikInput
                      name="firstName"
                      label="First Name"
                      placeholder="e.g. Saksham"
                      maxLength={50}
                      inputClassName="mhn-edit-profile-input"
                    />

                    <FormikInput
                      name="lastName"
                      label="Last Name"
                      placeholder="e.g. Garg"
                      maxLength={50}
                      inputClassName="mhn-edit-profile-input"
                    />
                  </div>

                  <div className="mhn-edit-profile-system-banner mhn-mt-16">
                    <FormikInput
                      name="dateOfBirth"
                      type="date"
                      label="Date of Birth"
                      inputClassName="mhn-edit-profile-input"
                    />

                    <Dropdown
                      label="Gender Category"
                      value={values.genderCategory}
                      options={GENDER_OPTIONS}
                      onChange={(val) => setFieldValue('genderCategory', val)}
                      placeholder="Select gender"
                    />
                  </div>
                </div>

                {/* Section 3: Player Athletic Details */}
                {isPlayer && (
                  <div className="mhn-mb-24">
                    <h3 className="mhn-section-heading">Player & Athletic Information</h3>

                    <div className="mhn-edit-profile-system-banner">
                      <Dropdown
                        label="Position"
                        value={values.position}
                        options={positionOptions}
                        onChange={(val) => setFieldValue('position', val)}
                        placeholder="Select position"
                      />

                      <Dropdown
                        label="Shoots / Catches"
                        value={values.shootsCatches}
                        options={SHOOTS_OPTIONS}
                        onChange={(val) => setFieldValue('shootsCatches', val)}
                        placeholder="Select option"
                      />

                      <FormikInput
                        name="jerseyNumber"
                        type="number"
                        label="Jersey Number (#)"
                        placeholder="e.g. 97"
                        min="0"
                        max="99"
                        inputClassName="mhn-edit-profile-input"
                      />
                    </div>
                  </div>
                )}

                {/* Location & Bio Section */}
                <div className="mhn-mb-24">
                  <div className="mhn-mt-16">
                    <FormikInput
                      name="city"
                      label="City / Location"
                      placeholder="e.g. Toronto, ON or Austria, Europe"
                      maxLength={50}
                      inputClassName="mhn-edit-profile-input"
                    />
                  </div>

                  <div className="mhn-mt-16">
                    <label className="mhn-form-label-block">Player Bio</label>
                    <Field name="bio">
                      {({ field, meta }: any) => (
                        <>
                          <Textarea
                            {...field}
                            placeholder="Write a brief intro about your hockey background and goals..."
                            rows={3}
                            className={`mhn-edit-profile-input mhn-bio-textarea ${meta.touched && meta.error ? 'mhn-input-invalid' : ''}`}
                          />
                          <div className="mhn-toggle-row-between">
                            <div>
                              {meta.touched && meta.error && (
                                <FormError message={meta.error} className="mhn-edit-profile-field-error" />
                              )}
                            </div>
                            <span className="mhn-edit-profile-char-count">
                              {values.bio.length} / 300
                            </span>
                          </div>
                        </>
                      )}
                    </Field>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="mhn-edit-profile-footer">
                  <span className={`mhn-unsaved-text ${isFormDirty ? 'dirty' : 'clean'}`}>
                    {isFormDirty ? '● Unsaved changes' : 'No changes made'}
                  </span>

                  <div className="mhn-btn-loading-flex">
                    <Button
                      type="button"
                      onClick={() => handleAttemptClose(isFormDirty)}
                      className="mhn-btn-profile-cancel"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={!isFormDirty || !isValid || isSubmitting}
                      className={`mhn-btn-profile-save ${!isFormDirty || !isValid || isSubmitting ? 'disabled' : 'active'}`}
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
              </Form>
            </div>
          );
        }}
      </Formik>

      {/* Discard Unsaved Changes Dialog */}
      {showDiscardConfirm && (
        <div className="mhn-discard-modal-overlay">
          <div className="mhn-discard-modal-card">
            <h3 className="mhn-discard-title">Discard Unsaved Changes?</h3>
            <p className="mhn-discard-sub">
              You have unsaved edits in your profile. Are you sure you want to discard them?
            </p>
            <div className="mhn-delete-modal-actions">
              <Button onClick={() => setShowDiscardConfirm(false)} className="mhn-btn-keep-editing">
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
