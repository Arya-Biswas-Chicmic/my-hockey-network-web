'use client';

import { useState } from 'react';
import { updateAuthProfile, uploadMediaFile, type AuthMeResponse } from '@my-hockey-network/core';
import { createFileSchema, IMAGE_MIME_TYPES } from '@my-hockey-network/validation';
import { ERROR_MESSAGES } from '@my-hockey-network/constants';

import { showErrorToast } from '@/utils/toast';
import { useImageCrop } from '@/hooks/use-image-crop';

interface UseProfileImageUploadsParams {
  setUserProfile: (profile: AuthMeResponse) => void;
  loadAuthMe: (silent?: boolean, force?: boolean) => Promise<AuthMeResponse | null>;
}

/**
 * Cover/avatar upload flow for the profile hero card: crop-on-upload
 * (`useImageCrop`), file-type/size validation, upload, and profile-record
 * update. Extracted from `screens/profile-page.tsx` so the screen owns
 * orchestration, not per-image-type upload plumbing.
 */
export function useProfileImageUploads({ setUserProfile, loadAuthMe }: UseProfileImageUploadsParams) {
  const { cropImage, cropModal } = useImageCrop();

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadMsg, setCoverUploadMsg] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleCoverFileChange = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const result = createFileSchema({ acceptedTypes: IMAGE_MIME_TYPES, maxBytes: 10 * 1024 * 1024 }).safeParse(file);
    if (!result.success) {
      showErrorToast(result.error.issues[0]?.message ?? ERROR_MESSAGES.FAILED_UPLOAD_COVER);
      return;
    }

    const cropped = await cropImage(file, { shape: 'rect', aspectRatio: 3, title: 'Adjust cover photo' });
    if (!cropped) return;

    setIsUploadingCover(true);
    setCoverUploadMsg(null);

    try {
      const uploadRes = await uploadMediaFile(cropped, 'COVER');
      if (uploadRes?.storageKey) {
        const updated = await updateAuthProfile({ coverImageKey: uploadRes.storageKey });
        if (updated) {
          setUserProfile(updated);
        }
        await loadAuthMe(true, true);
        setCoverUploadMsg('Cover image updated successfully!');
        setTimeout(() => setCoverUploadMsg(null), 3000);
      }
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_UPLOAD_COVER);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAvatarFileChange = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const result = createFileSchema({ acceptedTypes: IMAGE_MIME_TYPES, maxBytes: 10 * 1024 * 1024 }).safeParse(file);
    if (!result.success) {
      showErrorToast(result.error.issues[0]?.message ?? ERROR_MESSAGES.FAILED_UPLOAD_AVATAR);
      return;
    }

    const cropped = await cropImage(file, { shape: 'circle', title: 'Adjust profile photo' });
    if (!cropped) return;

    setIsUploadingAvatar(true);

    try {
      const uploadRes = await uploadMediaFile(cropped, 'AVATAR');
      if (uploadRes?.storageKey) {
        const updated = await updateAuthProfile({ avatarKey: uploadRes.storageKey });
        if (updated) {
          setUserProfile(updated);
        }
        await loadAuthMe(true, true);
      }
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_UPLOAD_AVATAR);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return {
    cropModal,
    isUploadingCover,
    coverUploadMsg,
    handleCoverFileChange,
    isUploadingAvatar,
    handleAvatarFileChange,
  };
}
