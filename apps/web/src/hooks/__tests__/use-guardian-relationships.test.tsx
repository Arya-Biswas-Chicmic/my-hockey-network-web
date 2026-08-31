// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryKeys } from '@my-hockey-network/contracts';

import { useAcceptGuardianInviteMutation, usePendingGuardianInvites } from '@/hooks/use-guardian-relationships';
import { createQueryClient } from '@/query/query-client';
import { QueryProvider } from '@/query/query-context';

const { acceptGuardianInvite, getPendingGuardianInvites } = vi.hoisted(() => ({
  acceptGuardianInvite: vi.fn(),
  getPendingGuardianInvites: vi.fn(),
}));

vi.mock('@my-hockey-network/core', () => ({
  acceptGuardianInvite,
  acceptGuardianRequest: vi.fn(),
  declineGuardianInvite: vi.fn(),
  declineGuardianRequest: vi.fn(),
  getPendingGuardianInvites,
  getPendingGuardianRequests: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function wrapper({ children }: { children: ReactNode }) {
  return <QueryProvider client={createQueryClient()}>{children}</QueryProvider>;
}

describe('guardian relationship query hooks', () => {
  it('uses the child-facing guardian-invites endpoint for Profile', async () => {
    getPendingGuardianInvites.mockResolvedValue({ invites: [{ id: 'invite-1' }] });
    const { result } = renderHook(() => usePendingGuardianInvites(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 'invite-1' }]);
    expect(getPendingGuardianInvites).toHaveBeenCalledOnce();
  });

  it('does not fetch child invitations when the guarded route is disabled', async () => {
    renderHook(() => usePendingGuardianInvites({ enabled: false }), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(getPendingGuardianInvites).not.toHaveBeenCalled();
  });

  it('invalidates the child invitation query after approval', async () => {
    acceptGuardianInvite.mockResolvedValue({ message: 'approved' });
    const client = createQueryClient();
    client.setQueryData([QueryKeys.PENDING_GUARDIAN_INVITES], [{ id: 'invite-1' }]);
    const { result } = renderHook(() => useAcceptGuardianInviteMutation(), {
      wrapper: ({ children }) => <QueryProvider client={client}>{children}</QueryProvider>,
    });

    result.current.mutate('123456');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(acceptGuardianInvite).toHaveBeenCalledWith('123456');
    expect(client.getQueryState([QueryKeys.PENDING_GUARDIAN_INVITES])?.isInvalidated).toBe(true);
  });
});
