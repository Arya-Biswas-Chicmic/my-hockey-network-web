'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@my-hockey-network/contracts';
import {
  acceptGuardianInvite,
  acceptGuardianRequest,
  declineGuardianInvite,
  declineGuardianRequest,
  getPendingGuardianInvites,
  getPendingGuardianRequests,
  type GuardianRelationshipRequest,
} from '@my-hockey-network/core';

const guardianInviteQueryKey = [QueryKeys.PENDING_GUARDIAN_INVITES] as const;
const guardianRequestQueryKey = [QueryKeys.PENDING_GUARDIAN_REQUESTS] as const;

interface GuardianQueryOptions {
  enabled?: boolean;
}

export function usePendingGuardianInvites(options?: GuardianQueryOptions) {
  return useQuery<GuardianRelationshipRequest[]>({
    queryKey: guardianInviteQueryKey,
    queryFn: async () => (await getPendingGuardianInvites()).invites ?? [],
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function usePendingGuardianRequests(options?: GuardianQueryOptions) {
  return useQuery<GuardianRelationshipRequest[]>({
    queryKey: guardianRequestQueryKey,
    queryFn: async () => (await getPendingGuardianRequests()).items ?? [],
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
}

function useGuardianMutation(
  mutationFn: (code: string) => Promise<{ message: string }>,
  queryKey: readonly [QueryKeys],
) {
  const queryClient = useQueryClient();
  return useMutation({
    // Wrap the API operation so TanStack's MutationFunctionContext is not
    // forwarded as the core service's optional `clientType` argument.
    mutationFn: (code: string) => mutationFn(code),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useAcceptGuardianInviteMutation() {
  return useGuardianMutation(acceptGuardianInvite, guardianInviteQueryKey);
}

export function useDeclineGuardianInviteMutation() {
  return useGuardianMutation(declineGuardianInvite, guardianInviteQueryKey);
}

export function useAcceptGuardianRequestMutation() {
  return useGuardianMutation(acceptGuardianRequest, guardianRequestQueryKey);
}

export function useDeclineGuardianRequestMutation() {
  return useGuardianMutation(declineGuardianRequest, guardianRequestQueryKey);
}
