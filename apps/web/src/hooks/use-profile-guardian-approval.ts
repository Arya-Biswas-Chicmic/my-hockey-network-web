'use client';

import { useState } from 'react';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import type { GuardianRelationshipRequest } from '@my-hockey-network/core';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import {
  useAcceptGuardianInviteMutation,
  useDeclineGuardianInviteMutation,
} from '@/hooks/use-guardian-relationships';
import {
  getGuardianRequestCode,
  getGuardianRequestName,
} from '@/components/features/profile/ProfileGuardianRequestsTab';

interface GuardianApprovalModalConfig {
  isOpen: boolean;
  targetName: string;
  code?: string;
  action: 'approve' | 'decline';
}

/**
 * Profile > Guardian Requests tab's approve/decline flow, including the
 * shared `ApprovalCodeModal` it opens when a decline has no pre-attached
 * code. Extracted from `screens/profile-page.tsx`.
 */
export function useProfileGuardianApproval() {
  const acceptGuardianInviteMutation = useAcceptGuardianInviteMutation();
  const declineGuardianInviteMutation = useDeclineGuardianInviteMutation();
  const [guardianApprovalModalConfig, setGuardianApprovalModalConfig] = useState<GuardianApprovalModalConfig>({
    isOpen: false,
    targetName: '',
    code: '',
    action: 'approve',
  });

  const handleAcceptGuardianReq = async (code: string) => {
    if (!code) {
      const error = new Error('Enter the 6-digit invitation code to approve this guardian.');
      showErrorToast(error, ERROR_MESSAGES.FAILED_APPROVE_REQUEST);
      throw error;
    }
    try {
      const res = await acceptGuardianInviteMutation.mutateAsync(code);
      showSuccessToast(res.message || SUCCESS_MESSAGES.GUARDIAN_REQUEST_APPROVED);
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_APPROVE_REQUEST);
      throw err;
    }
  };

  const handleDeclineGuardianReq = async (code: string) => {
    if (!code) {
      const error = new Error('This invitation does not include a decline code.');
      showErrorToast(error, ERROR_MESSAGES.FAILED_DECLINE_REQUEST);
      throw error;
    }
    try {
      const res = await declineGuardianInviteMutation.mutateAsync(code);
      showSuccessToast(res.message || SUCCESS_MESSAGES.GUARDIAN_REQUEST_DECLINED);
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_DECLINE_REQUEST);
      throw err;
    }
  };

  const handleRequestDecline = (selectedRequest: GuardianRelationshipRequest) => {
    const code = getGuardianRequestCode(selectedRequest);
    if (code) {
      // Toast already shown inside handleDeclineGuardianReq on failure;
      // this path has no modal to keep open, so just prevent an unhandled rejection.
      void handleDeclineGuardianReq(code).catch(() => {});
      return;
    }
    setGuardianApprovalModalConfig({
      isOpen: true,
      targetName: getGuardianRequestName(selectedRequest),
      code: '',
      action: 'decline',
    });
  };

  const handleRequestApprove = (selectedRequest: GuardianRelationshipRequest) => {
    setGuardianApprovalModalConfig({
      isOpen: true,
      targetName: getGuardianRequestName(selectedRequest),
      code: getGuardianRequestCode(selectedRequest),
      action: 'approve',
    });
  };

  const closeApprovalModal = () => setGuardianApprovalModalConfig((prev) => ({ ...prev, isOpen: false }));

  const submitApprovalModal = async (enteredCode: string) => {
    if (guardianApprovalModalConfig.action === 'approve') {
      await handleAcceptGuardianReq(enteredCode);
    } else {
      await handleDeclineGuardianReq(enteredCode);
    }
    closeApprovalModal();
  };

  return {
    guardianApprovalModalConfig,
    isProcessing: acceptGuardianInviteMutation.isPending || declineGuardianInviteMutation.isPending,
    handleRequestDecline,
    handleRequestApprove,
    closeApprovalModal,
    submitApprovalModal,
  };
}
