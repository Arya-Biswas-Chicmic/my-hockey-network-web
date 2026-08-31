'use client';

import { useState, useEffect } from 'react';
import {
  getApprovals,
  approveRequest,
  declineRequest,
  type ApprovalItem,
  type GuardianRelationshipRequest,
  type Counterparty,
} from '@my-hockey-network/core';
import { ToastTypeEnum } from '@my-hockey-network/contracts';

import { extractErrorMessage, getApiErrorKey } from '@/utils/toast';
import {
  useAcceptGuardianRequestMutation,
  useDeclineGuardianRequestMutation,
} from '@/hooks/use-guardian-relationships';

export type PendingSupervisionRequest = (ApprovalItem | GuardianRelationshipRequest) & {
  isApprovalItem?: boolean;
  isGuardianInviteItem?: boolean;
  requester?: Counterparty;
  minorCard?: Partial<Counterparty>;
  minor?: Partial<Counterparty>;
  child?: Partial<Counterparty>;
  displayName?: string;
  name?: string;
  avatarUrl?: string | null;
  teamName?: string;
  location?: string;
  code?: string;
  devCode?: string;
  inviteCode?: string;
  action?: string;
  subject?: { kind?: string; audience?: string; body?: string };
};

interface UseSupervisionRequestsParams {
  activeMainTab: string;
  requestsTabValue: string;
  selectedWardId: string;
  onWardApproved: () => void | Promise<void>;
  showToast: (message: string, type: ToastTypeEnum) => void;
}

/**
 * Supervision > Requests tab: the two independent request kinds this
 * screen handles — general approval items (posts/comments/reactions
 * pending guardian approval) and guardian-relationship requests (a minor
 * asking to be supervised) — plus their approve/decline actions.
 * Extracted from `screens/supervision-page.tsx`.
 */
export function useSupervisionRequests({
  activeMainTab,
  requestsTabValue,
  selectedWardId,
  onWardApproved,
  showToast,
}: UseSupervisionRequestsParams) {
  const acceptGuardianRequestMutation = useAcceptGuardianRequestMutation();
  const declineGuardianRequestMutation = useDeclineGuardianRequestMutation();

  const [livePendingRequests, setLivePendingRequests] = useState<PendingSupervisionRequest[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [approvalCodeInput, setApprovalCodeInput] = useState('');
  const [requestActionLoading, setRequestActionLoading] = useState(false);
  const [requestNotice, setRequestNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadPendingRequests = async () => {
    try {
      setIsRequestsLoading(true);
      setLivePendingRequests([]);
      let list: PendingSupervisionRequest[] = [];

      const isRealUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(selectedWardId);
      const approvalsRes = await getApprovals({ status: 'PENDING', minorId: isRealUuid ? selectedWardId : undefined, limit: 20 });
      const approvalItems = approvalsRes.items;
      if (Array.isArray(approvalItems)) {
        list = [...list, ...approvalItems.map((item) => ({ ...item, isApprovalItem: true }))];
      }

      setLivePendingRequests(list);
    } catch (err: unknown) {
      console.warn('Pending requests fetch notice:', err);
    } finally {
      setIsRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainTab === requestsTabValue) {
      void loadPendingRequests();
    }
  }, [activeMainTab, selectedWardId]);

  const handleApproveApprovalItem = async (approvalId: string) => {
    setRequestActionLoading(true);
    setRequestNotice(null);
    try {
      const res = await approveRequest(approvalId, { mode: 'SINGLE_USE' });
      const isPublished = res?.advanced === 'POST_PUBLISHED';
      const successMsg = isPublished
        ? 'Request approved! The post has been published to the feed.'
        : 'Request approved successfully!';
      setRequestNotice({ type: 'success', message: successMsg });
      showToast(successMsg, ToastTypeEnum.SUCCESS);
      void loadPendingRequests();
    } catch (err: unknown) {
      const errMsg = extractErrorMessage(err, 'Failed to approve request.');
      setRequestNotice({ type: 'error', message: errMsg });
      showToast(errMsg, ToastTypeEnum.ERROR);
    } finally {
      setRequestActionLoading(false);
    }
  };

  const handleDeclineApprovalItem = async (approvalId: string) => {
    setRequestActionLoading(true);
    setRequestNotice(null);
    try {
      await declineRequest(approvalId, 'Declined by parent');
      const successMsg = 'Request declined. The item will remain unpublished.';
      setRequestNotice({ type: 'success', message: successMsg });
      showToast(successMsg, ToastTypeEnum.INFO);
      void loadPendingRequests();
    } catch (err: unknown) {
      const errMsg = extractErrorMessage(err, 'Failed to decline request.');
      setRequestNotice({ type: 'error', message: errMsg });
      showToast(errMsg, ToastTypeEnum.ERROR);
    } finally {
      setRequestActionLoading(false);
    }
  };

  const handleApproveCodeSubmit = async (codeToSubmit?: string) => {
    const code = (codeToSubmit || approvalCodeInput).trim();
    if (!code || code.length !== 6) {
      const msg = 'Please enter a valid 6-digit approval code.';
      setRequestNotice({ type: 'error', message: msg });
      showToast(msg, ToastTypeEnum.ERROR);
      throw new Error(msg);
    }

    setRequestActionLoading(true);
    setRequestNotice(null);

    try {
      const res = await acceptGuardianRequestMutation.mutateAsync(code);
      const successMsg = res.message || 'Player approval accepted! You are now supervising this player.';
      setRequestNotice({ type: 'success', message: successMsg });
      showToast(successMsg, ToastTypeEnum.SUCCESS);
      setApprovalCodeInput('');
      await onWardApproved();
      void loadPendingRequests();
    } catch (err: unknown) {
      console.error('Accept Request Error:', err);
      const errorMessage = extractErrorMessage(err, 'Failed to approve request. Please verify the code and try again.');
      const errMsg = getApiErrorKey(err) === 'GUARDIAN_REQUEST_CHILD_SETUP_INCOMPLETE' || errorMessage.includes('setup')
        ? "This player hasn't finished setting up their profile yet — try again shortly."
        : errorMessage;

      setRequestNotice({ type: 'error', message: errMsg });
      showToast(errMsg, ToastTypeEnum.ERROR);
      throw err;
    } finally {
      setRequestActionLoading(false);
    }
  };

  const handleDeclineCodeSubmit = async (codeToDecline: string) => {
    if (!codeToDecline) {
      const error = new Error('This request does not include a decline code.');
      setRequestNotice({ type: 'error', message: error.message });
      throw error;
    }
    setRequestActionLoading(true);
    setRequestNotice(null);

    try {
      await declineGuardianRequestMutation.mutateAsync(codeToDecline);
      setRequestNotice({ type: 'success', message: 'Guardian request declined.' });
    } catch (err: unknown) {
      setRequestNotice({ type: 'error', message: extractErrorMessage(err, 'Failed to decline request.') });
      throw err;
    } finally {
      setRequestActionLoading(false);
    }
  };

  return {
    guardianRequestMutations: { acceptGuardianRequestMutation, declineGuardianRequestMutation },
    livePendingRequests,
    isRequestsLoading,
    approvalCodeInput,
    requestActionLoading,
    requestNotice,
    handleApproveApprovalItem,
    handleDeclineApprovalItem,
    handleApproveCodeSubmit,
    handleDeclineCodeSubmit,
  };
}
