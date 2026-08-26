import { useState, useCallback } from 'react';
import { deletePost } from '@my-hockey-network/core';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { normalizeApiError } from '@/logic/errors/errorNormalizer';

interface UsePostDeleteOptions {
  postId: string;
  onDeleteSuccess?: (id: string, message?: string) => void;
  onShareSuccess?: (message: string) => void;
  onRepostComplete?: () => void;
}

export function usePostDelete({
  postId,
  onDeleteSuccess,
  onShareSuccess,
  onRepostComplete,
}: UsePostDeleteOptions) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const confirmDelete = useCallback(async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      await deletePost(postId);
      setIsDeleteModalOpen(false);
      showSuccessToast(SUCCESS_MESSAGES.POST_DELETED);

      if (onDeleteSuccess) {
        onDeleteSuccess(postId, SUCCESS_MESSAGES.POST_DELETED);
      }
      if (onShareSuccess) {
        onShareSuccess(SUCCESS_MESSAGES.POST_DELETED);
      }
      if (onRepostComplete) {
        onRepostComplete();
      }

      setTimeout(() => {
        setIsDeleted(true);
      }, 300);
    } catch (err: unknown) {
      const appErr = normalizeApiError(err, ERROR_MESSAGES.FAILED_DELETE_POST);
      showErrorToast(appErr, ERROR_MESSAGES.FAILED_DELETE_POST);
    } finally {
      setIsDeleting(false);
    }
  }, [postId, isDeleting, onDeleteSuccess, onShareSuccess, onRepostComplete]);

  return {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    isDeleted,
    confirmDelete,
  };
}
