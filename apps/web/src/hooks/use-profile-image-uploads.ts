'use client';

import { useState } from 'react';
import { type AuthMeResponse } from '@my-hockey-network/core';
import { createFileSchema, IMAGE_MIME_TYPES } from '@my-hockey-network/validation';
import { ERROR_MESSAGES } from '@my-hockey-network/constants';

import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useImageCrop } from '@/hooks/use-image-crop';
import { useAuth } from '@/hooks/use-auth';
import { saveProfilePhotoDummy } from '@/services/profile-photo.service';
import { getLocalAvatar, readFileAsDataUrl, setLocalAvatar } from '@/utils/local-avatar-storage';

interface UseProfileImageUploadsParams {
  setUserProfile: (profile: AuthMeResponse) => void;
  loadAuthMe: (silent?: boolean, force?: boolean) => Promise<AuthMeResponse | null>;
}

/**
 * Avatar upload flow for the profile hero card's camera badge: crop-on-
 * upload (`useImageCrop`), file-type/size validation, save, and profile-
 * record update. Extracted from `screens/profile-page.tsx` so the screen
 * owns orchestration, not per-image-type upload plumbing. Cover photo used
 * to go through here too; feedback 2026-08-29: "no cover photo required in
 * user profile" retired that half — avatar-only now.
 *
 * Local-first (feedback 2026-08-29 — "currently API is not working... save
 * to locally... everywhere we will fetch from the local profile photo... API
 * implementations will be done later but keep mechanism same"): the cropped
 * photo is read into a data URL and cached in `localStorage`
 * (`@/utils/local-avatar-storage`) as soon as the (currently dummy) save
 * call reports success — real or not, that cache is what every avatar
 * render in the app reads from now (see that module's and
 * `auth-context.tsx`'s comments), not the raw `avatarUrl` this API call
 * would return. If the save call fails, the local cache is left untouched
 * so the previous photo keeps showing rather than a broken one.
 */
export function useProfileImageUploads({ setUserProfile, loadAuthMe }: UseProfileImageUploadsParams) {
  const { user } = useAuth();
  const { cropImage, cropModal } = useImageCrop();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarFileChange = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const result = createFileSchema({ acceptedTypes: IMAGE_MIME_TYPES, maxBytes: 10 * 1024 * 1024 }).safeParse(file);
    if (!result.success) {
      showErrorToast(result.error.issues[0]?.message ?? ERROR_MESSAGES.FAILED_UPLOAD_AVATAR);
      return;
    }

    const profileId = user?.profile?.id || user?.id;
    if (!profileId) {
      showErrorToast(ERROR_MESSAGES.FAILED_UPLOAD_AVATAR);
      return;
    }

    const cropped = await cropImage(file, { shape: 'circle', title: 'Adjust profile photo' });
    if (!cropped) return;

    setIsUploadingAvatar(true);

    try {
      const dataUrl = await readFileAsDataUrl(cropped);
      const saveRes = await saveProfilePhotoDummy(dataUrl);

      if (saveRes.success) {
        setLocalAvatar(profileId, saveRes.avatarUrl || dataUrl);
        if (user) {
          setUserProfile({ ...user, profile: user.profile ? { ...user.profile, avatarUrl: getLocalAvatar(profileId) } : user.profile });
        }
        showSuccessToast('Profile photo updated.');
        await loadAuthMe(true, true);
      } else {
        // Real-API failure path (not reachable from the dummy today, which
        // always succeeds) — leave whatever's already cached alone rather
        // than clearing it, per "if API returns failed than keep old photo".
        showErrorToast(saveRes.error ?? ERROR_MESSAGES.FAILED_UPLOAD_AVATAR);
      }
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_UPLOAD_AVATAR);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return {
    cropModal,
    isUploadingAvatar,
    handleAvatarFileChange,
  };
}
