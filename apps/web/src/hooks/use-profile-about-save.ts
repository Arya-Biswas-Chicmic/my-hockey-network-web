'use client';

import { useState } from 'react';
import { QueryKeys, type AuthMeResponse } from '@my-hockey-network/contracts';
import { ERROR_MESSAGES } from '@my-hockey-network/constants';
import { globalQueryClient, invalidateQueryPrefix } from '@/query';
import { showErrorToast } from '@/utils/toast';
import { useUpdateProfileMutation } from '@/hooks/use-update-profile';
import type { EditProfileFormData } from '@/components/features/profile';

const ALLOWED_POSITIONS = ['Center', 'Left Wing', 'Right Wing', 'Defense', 'Goaltender'];

export interface UseProfileAboutSaveParams {
  setUserProfile: (profile: AuthMeResponse) => void;
  loadAuthMe: (silent?: boolean, force?: boolean) => Promise<AuthMeResponse | null>;
}

/**
 * The three "save some subset of profile fields" flows on the Profile
 * screen — About > Intro, About > Personal Details, and the full Edit
 * Profile modal. Extracted from `screens/profile-page.tsx`. Each keeps its
 * own `useMutation` instance (not a shared one) so their `isPending` states
 * stay independent — saving Intro must not show Details as "saving" too.
 */
export function useProfileAboutSave({ setUserProfile, loadAuthMe }: UseProfileAboutSaveParams) {
  const [introSaveMsg, setIntroSaveMsg] = useState<string | null>(null);
  const [detailsSaveMsg, setDetailsSaveMsg] = useState<string | null>(null);

  const saveIntroMutation = useUpdateProfileMutation();
  const saveDetailsMutation = useUpdateProfileMutation();
  const saveProfileMutation = useUpdateProfileMutation();

  const handleSaveIntro = async (values: { bio: string; position: string; jerseyNumber: string }) => {
    setIntroSaveMsg(null);
    try {
      const validPosition = ALLOWED_POSITIONS.includes(values.position) ? values.position : 'Center';
      const dto = {
        bio: values.bio || undefined,
        position: validPosition,
        jerseyNumber: values.jerseyNumber !== '' ? Number(values.jerseyNumber) : undefined,
      };
      const res = await saveIntroMutation.mutateAsync(dto);
      if (res) {
        setUserProfile(res);
      }
      await loadAuthMe(true, true);
      void invalidateQueryPrefix(globalQueryClient, QueryKeys.USER_PROFILE);
      setIntroSaveMsg('Intro saved successfully!');
      setTimeout(() => setIntroSaveMsg(null), 3000);
    } catch (err: unknown) {
      console.error('❌ Save Intro error:', err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_SAVE_INTRO);
    }
  };

  const handleSaveDetails = async (values: { city: string; dateOfBirth: string; genderCategory: string }) => {
    setDetailsSaveMsg(null);
    try {
      const dto = {
        city: values.city || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        genderCategory: values.genderCategory || undefined,
      };
      const res = await saveDetailsMutation.mutateAsync(dto);
      if (res) {
        setUserProfile(res);
      }
      await loadAuthMe(true, true);
      void invalidateQueryPrefix(globalQueryClient, QueryKeys.USER_PROFILE);
      setDetailsSaveMsg('Personal details saved successfully!');
      setTimeout(() => setDetailsSaveMsg(null), 3000);
    } catch (err: unknown) {
      console.error('❌ Save Details error:', err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_SAVE_PERSONAL_DETAILS);
    }
  };

  const handleSaveProfile = async (data: EditProfileFormData) => {
    let formattedDob = data?.dateOfBirth;
    if (formattedDob && formattedDob.includes('T')) {
      formattedDob = formattedDob.split('T')[0];
    }

    // Rule from media-uploads.md: Sending both avatarKey and avatarUrl returns 400.
    // If avatarKey is present (uploaded via Step 1 & Step 2), send avatarKey and omit avatarUrl.
    const avatarKeyToSend: string | undefined = data?.avatarKey;
    let avatarUrlToSend: string | undefined = undefined;

    if (!avatarKeyToSend && data?.avatarUrl && data?.avatarUrl !== '/userPlaceholder.webp' && !data?.avatarUrl.includes('userPlaceholder.webp') && !data?.avatarUrl.startsWith('blob:')) {
      avatarUrlToSend = data?.avatarUrl;
    }

    const validPosition = data?.position && ALLOWED_POSITIONS.includes(data.position) ? data.position : 'Center';

    const dto = {
      displayName: data?.displayName || undefined,
      firstName: data?.firstName || undefined,
      lastName: data?.lastName || undefined,
      bio: data?.bio || undefined,
      city: data?.city || undefined,
      dateOfBirth: formattedDob || undefined,
      position: validPosition,
      shootsCatches: data?.shootsCatches || undefined,
      jerseyNumber: data?.jerseyNumber !== '' && data?.jerseyNumber !== null && data?.jerseyNumber !== undefined ? Number(data?.jerseyNumber) : undefined,
      genderCategory: data?.genderCategory || undefined,
      height: data?.height || undefined,
      weight: data?.weight !== '' && data?.weight !== null && data?.weight !== undefined ? Number(data?.weight) : undefined,
      avatarKey: avatarKeyToSend,
      avatarUrl: avatarUrlToSend,
    };

    try {
      const res = await saveProfileMutation.mutateAsync(dto);
      if (res) {
        setUserProfile(res);
        void globalQueryClient.invalidateQueries({ queryKey: [QueryKeys.AUTH_ME] });
        void invalidateQueryPrefix(globalQueryClient, QueryKeys.USER_PROFILE);
        await loadAuthMe(true, true);
        return res;
      }
    } catch (err: unknown) {
      console.error('❌ [ProfilePage] Update Profile Error:', err);
      throw err;
    }
  };

  return {
    introSaveMsg,
    detailsSaveMsg,
    isSavingIntro: saveIntroMutation.isPending,
    isSavingDetails: saveDetailsMutation.isPending,
    handleSaveIntro,
    handleSaveDetails,
    handleSaveProfile,
  };
}
