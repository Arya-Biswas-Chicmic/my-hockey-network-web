'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import type { AuthMeResponse } from '@my-hockey-network/contracts';
import { QueryKeys } from '@my-hockey-network/contracts';
import { editProfileFormSchema, type EditProfileFormValues } from '@my-hockey-network/validation';
import { globalQueryClient, invalidateQueryPrefix } from '@/query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

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
 * All form/submit logic for `EditProfileModal`: RHF setup, save/discard
 * state, and re-syncing the form whenever the modal (re)opens or the
 * authenticated user changes. Extracted from `EditProfileModal.tsx`, which
 * now owns only layout. Avatar/cover photo are no longer edited from here —
 * feedback 2026-08-28: "we are not giving option to change photo or cover
 * photo so remove that from edit profile popup and user can update photo
 * from profile icon and pencil or camera like in profile" — both now
 * upload immediately from `ProfileHeroCard`'s camera badge via
 * `useProfileImageUploads`, the same as it always did for the avatar —
 * feedback 2026-08-29: "no cover photo required in user profile" retired
 * the cover half of that flow entirely, avatar-only stays.
 */
export function useEditProfileForm({ isOpen, onClose, onSave, profileData }: UseEditProfileFormParams) {
  const { user } = useAuth();

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
        // Honestly empty rather than guessed: a fabricated default here (e.g. "Center",
        // "Left", "Male") would get silently submitted to the backend as the user's real
        // value if they save without touching these fields — see docs/DEMO_DATA_POLICY.md.
        position: String(profRecord.position || ''),
        shootsCatches: String(profRecord.shootsCatches || profRecord.shoots || ''),
        jerseyNumber: profRecord.jerseyNumber !== null && profRecord.jerseyNumber !== undefined ? String(profRecord.jerseyNumber) : '',
        genderCategory: String(profRecord.genderCategory || profRecord.gender || ''),
        height: String(profRecord.height || ''),
        preferredLanguage: String(profRecord.preferredLanguage || 'en'),
        defaultVisibility: String(profRecord.defaultVisibility || 'CONNECTIONS'),
        avatarUrl: resolveMediaUrl(profRecord.avatarUrl as string | undefined, '/userPlaceholder.webp'),
      };
    },
    [user]
  );

  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    mode: 'onChange',
    defaultValues: extractProfileValues(profileData || user),
  });
  const formData = useWatch({ control: form.control });

  const submitProfile = form.handleSubmit(async (values) => {
    setSubmissionError(null);

    try {
      const apiResponse = await onSave?.(values);
      let freshData: EditProfileFormData;

      if (apiResponse?.profile) {
        globalQueryClient.setQueryData([QueryKeys.AUTH_ME], apiResponse);
        freshData = extractProfileValues(apiResponse);
      } else {
        void globalQueryClient.invalidateQueries({ queryKey: [QueryKeys.AUTH_ME] });
        freshData = extractProfileValues(profileData || user);
      }

      void invalidateQueryPrefix(globalQueryClient, QueryKeys.USER_PROFILE);
      form.reset(freshData);
      setSaveSuccessMsg('Profile updated successfully!');
      window.setTimeout(() => {
        setSaveSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
      setSubmissionError(message);
    }
  });

  // Sync form data whenever modal opens or user object updates
  useEffect(() => {
    if (isOpen) {
      const init = extractProfileValues();
      form.reset(init);
      setSubmissionError(null);
      setSaveSuccessMsg(null);
      setShowDiscardConfirm(false);
    }
  }, [form, isOpen, user, extractProfileValues]);

  const userEmail = user?.email || '';
  const userPrimaryRole = user?.primaryRole || user?.profile?.type || 'PLAYER';
  const isPlayer = userPrimaryRole.toUpperCase() === 'PLAYER';

  const { errors, isSubmitting, isDirty } = form.formState;
  const isFormDirty = isDirty;

  const handleChange = (field: keyof EditProfileFormValues, value: string) => {
    form.setValue(field, value, { shouldDirty: true, shouldValidate: true });
    setSubmissionError(null);
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
    userEmail,
    userPrimaryRole,
    isPlayer,
    isSubmitting,
    isFormDirty,
    isSaveDisabled,
    handleChange,
    handleAttemptClose,
    showDiscardConfirm,
    setShowDiscardConfirm,
    saveSuccessMsg,
    submissionError,
  };
}
