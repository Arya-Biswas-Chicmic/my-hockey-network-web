import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getApprovals, approveRequest, declineRequest } from '../approvalsApi';
import { getSupervisionLogs } from '../supervisionApi';
import { getPendingGuardianRequests, acceptGuardianRequest, declineGuardianRequest } from '../relationshipsApi';
import * as clientModule from '../client';

describe('Approvals, Supervision Logs & Guardian Requests API Contract', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls apiFetch with correct URL and query params for getApprovals', async () => {
    const apiFetchSpy = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue({
      items: [
        {
          id: 'approval-1',
          minorId: 'child-123',
          actionType: 'RECEIVE_CONNECTION_REQUEST',
          status: 'PENDING',
          createdAt: '2026-08-24T12:00:00.000Z',
        },
      ],
    } as any);

    const result = await getApprovals({ minorId: 'child-123', status: 'PENDING', limit: 20 });

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/approvals?status=PENDING&minorId=child-123&limit=20',
      { method: 'GET' },
      'web'
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('approval-1');
  });

  it('calls apiFetch with POST for approveRequest', async () => {
    const apiFetchSpy = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue({
      advanced: 'ACTIVE',
    } as any);

    const result = await approveRequest('approval-1', { mode: 'INDEFINITE', note: 'Approved by parent' });

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/approvals/approval-1/approve',
      {
        method: 'POST',
        body: JSON.stringify({ mode: 'INDEFINITE', note: 'Approved by parent' }),
      },
      'web'
    );
    expect(result.advanced).toBe('ACTIVE');
  });

  it('calls apiFetch with POST for declineRequest', async () => {
    const apiFetchSpy = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue({
      message: 'Declined successfully',
    } as any);

    const result = await declineRequest('approval-1', 'Not known to minor');

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/approvals/approval-1/decline',
      {
        method: 'POST',
        body: JSON.stringify({ note: 'Not known to minor' }),
      },
      'web'
    );
    expect(result.message).toBe('Declined successfully');
  });

  it('calls apiFetch with GET for getSupervisionLogs with minorId and limit', async () => {
    const apiFetchSpy = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue({
      items: [
        {
          id: 'log-1',
          minorId: 'child-123',
          eventType: 'CONNECTION_REQUEST_RECEIVED',
          summary: 'Received connection request from Jordan',
          createdAt: '2026-08-24T12:00:00.000Z',
        },
      ],
    } as any);

    const result = await getSupervisionLogs('child-123', { limit: 20 });

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/supervision/child-123/logs?limit=20',
      { method: 'GET' },
      'web'
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('log-1');
  });

  it('calls apiFetch for getPendingGuardianRequests', async () => {
    const apiFetchSpy = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue({
      items: [
        {
          id: 'req-101',
          code: '123456',
          displayName: 'Noah Child',
        },
      ],
    } as any);

    const result = await getPendingGuardianRequests();

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/relationships/guardian-requests/pending',
      { method: 'GET' },
      'web'
    );
    expect(result.items).toHaveLength(1);
  });

  it('calls apiFetch for acceptGuardianRequest and declineGuardianRequest with code', async () => {
    const apiFetchSpy = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue({
      message: 'Guardian request accepted',
    } as any);

    const acceptRes = await acceptGuardianRequest('123456');
    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/relationships/guardian-requests/accept',
      {
        method: 'POST',
        body: JSON.stringify({ code: '123456' }),
      },
      'web'
    );
    expect(acceptRes.message).toBe('Guardian request accepted');

    const declineRes = await declineGuardianRequest('123456');
    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/relationships/guardian-requests/decline',
      {
        method: 'POST',
        body: JSON.stringify({ code: '123456' }),
      },
      'web'
    );
    expect(declineRes.message).toBe('Guardian request accepted');
  });
});
