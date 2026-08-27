'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { uploadMediaFile } from '@my-hockey-network/core';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import type { AuthMeResponse } from '@my-hockey-network/contracts';
import { QueryKeys } from '@my-hockey-network/contracts';
import { createFileSchema, editProfileFormSchema, IMAGE_MIME_TYPES, type EditProfileFormValues } from '@my-hockey-network/validation';
import { globalQueryClient } from '@/query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useImageCrop } from '@/hooks/use-image-crop';

export interface EditProfileFormData extends EditProfileFormValues {
  avatarKey?: string;
}

export interface UseEditProfileFormParams {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: EditProfileFormData) => Promise<AuthMeResponse | void> | void;
  profileData?: Partial<EditProfileFormData> | Record<string, unknown> | null;
}

/**
 * All form/upload/submit logic for `EditProfileModal`: RHF setup, the
 * cropped-avatar upload flow, save/discard state, and re-syncing the form
 * whenever the modal (re)opens or the authenticated user changes. Extracted
 * from `EditProfileModal.tsx`, which now owns only layout.
 */
export function useEditProfileForm({ isOpen, onClose, onSave, profileData }: UseEditProfileFormParams) {
  const { user } = useAuth();
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

  const userEmail = user?.email || '';
  const userPrimaryRole = user?.primaryRole || user?.profile?.type || 'PLAYER';
  const isPlayer = userPrimaryRole.toUpperCase() === 'PLAYER';

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

  const handleRemoveAvatar = () => {
    revokeAvatarPreview();
    setSelectedAvatarFile(null);
    handleChange('avatarUrl', '/userPlaceholder.png');
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

  return {
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
    handleChange,
    handleAvatarFileChange,
    handleRemoveAvatar,
    handleAttemptClose,
    showDiscardConfirm,
    setShowDiscardConfirm,
    saveSuccessMsg,
    submissionError,
  };
}
