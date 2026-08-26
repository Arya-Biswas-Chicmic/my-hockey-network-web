import { useState, useCallback } from 'react';
import { updatePost } from '@my-hockey-network/core';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { normalizeApiError } from '@/logic/errors/errorNormalizer';

interface UsePostEditOptions {
  postId: string;
  initialContent: string;
  onUpdateSuccess?: (id: string, newContent: string) => void;
}

export function usePostEdit({ postId, initialContent, onUpdateSuccess }: UsePostEditOptions) {
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [postContent, setPostContent] = useState<string>(initialContent);
  const [editContentInput, setEditContentInput] = useState<string>(initialContent);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const saveEdit = useCallback(async () => {
    if (isUpdating || !editContentInput.trim()) return;
    setIsUpdating(true);

    try {
      await updatePost(postId, { body: editContentInput.trim() });
      setPostContent(editContentInput.trim());
      setIsEditModalOpen(false);
      showSuccessToast(SUCCESS_MESSAGES.POST_UPDATED);
      if (onUpdateSuccess) {
        onUpdateSuccess(postId, editContentInput.trim());
      }
    } catch (err: unknown) {
      const appErr = normalizeApiError(err, ERROR_MESSAGES.FAILED_UPDATE_POST);
      showErrorToast(appErr, ERROR_MESSAGES.FAILED_UPDATE_POST);
    } finally {
      setIsUpdating(false);
    }
  }, [postId, isUpdating, editContentInput, onUpdateSuccess]);

  return {
    postContent,
    isEditModalOpen,
    setIsEditModalOpen,
    editContentInput,
    setEditContentInput,
    isUpdating,
    saveEdit,
  };
}
