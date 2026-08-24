import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';

export interface ApprovalItem {
  id: string;
  minorId: string;
  guardianId?: string;
  actionType: string;
  subjectType: string;
  subjectId: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED';
  note?: string | null;
  createdAt: string;
  updatedAt?: string;
  minorProfile?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  details?: Record<string, any>;
}

export interface ApproveRequestDTO {
  mode?: 'SINGLE_USE' | 'DURATION' | 'UNBOUNDED' | 'INDEFINITE';
  expiresAt?: string; // Required when mode === 'DURATION'
  note?: string;
}

/**
 * Fetch Guardian Approval Requests List
 */
export async function getApprovals(
  params?: { status?: string; minorId?: string; cursor?: string; limit?: number },
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ items: ApprovalItem[]; nextCursor?: string | null }> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.minorId) query.set('minorId', params.minorId);
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<{ items: ApprovalItem[]; nextCursor?: string | null }>(
    `${API_ENDPOINTS.APPROVALS.BASE}${queryString}`,
    { method: 'GET' },
    clientType
  );
}

/**
 * Get Approval Item by ID
 */
export async function getApprovalById(id: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ approval: ApprovalItem }> {
  return apiFetch<{ approval: ApprovalItem }>(
    API_ENDPOINTS.APPROVALS.GET_APPROVAL(id),
    { method: 'GET' },
    clientType
  );
}

/**
 * Approve Pending Request (POST /v1/approvals/:id/approve)
 */
export async function approveRequest(
  id: string,
  dto?: ApproveRequestDTO,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ advanced: string; approval?: ApprovalItem }> {
  return apiFetch<{ advanced: string; approval?: ApprovalItem }>(
    API_ENDPOINTS.APPROVALS.APPROVE(id),
    {
      method: 'POST',
      body: JSON.stringify(dto || {}),
    },
    clientType
  );
}

/**
 * Decline Pending Request (POST /v1/approvals/:id/decline)
 */
export async function declineRequest(
  id: string,
  note?: string,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ message: string; approval?: ApprovalItem }> {
  return apiFetch<{ message: string; approval?: ApprovalItem }>(
    API_ENDPOINTS.APPROVALS.DECLINE(id),
    {
      method: 'POST',
      body: JSON.stringify({ note }),
    },
    clientType
  );
}
