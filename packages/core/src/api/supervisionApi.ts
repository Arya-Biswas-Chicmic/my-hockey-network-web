import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';

export interface CreateManagedChildDTO {
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  guardianRelation: 'MOTHER' | 'FATHER' | 'LEGAL_GUARDIAN' | 'GRANDPARENT' | 'OTHER';
  email?: string;
  profileVisibility?: 'CONNECTIONS' | 'PUBLIC' | 'ONLY_ME';
  requireApprovalAdultContact?: boolean;
  requireApprovalConnections?: boolean;
  requireApprovalTeamInvites?: boolean;
  requireApprovalMedia?: boolean;
}

export interface SupervisionChildItem {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  dateOfBirth?: string;
  linkedAt?: string;
  avatarUrl?: string | null;
  accessLevel?: string;
}

export interface SupervisionControlItem {
  control: string;
  value: boolean | string;
  description?: string;
  configurable?: boolean;
}

export interface SupervisionLogItem {
  id: string;
  minorId: string;
  eventType: string;
  summary: string;
  createdAt: string;
}

/**
 * Fetch Supervision Data (Parent-only list of managed children)
 */
export async function getSupervisionData(clientType: 'web' | 'mobile' = 'web'): Promise<{ children: SupervisionChildItem[] }> {
  return apiFetch<{ children: SupervisionChildItem[] }>(
    API_ENDPOINTS.SUPERVISION.BASE,
    { method: 'GET' },
    clientType
  );
}

/**
 * Create Parent-Managed Child Profile (POST /v1/supervision/children)
 */
export async function createManagedChild(
  dto: CreateManagedChildDTO,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ child: SupervisionChildItem }> {
  return apiFetch<{ child: SupervisionChildItem }>(
    API_ENDPOINTS.SUPERVISION.CHILDREN,
    {
      method: 'POST',
      body: JSON.stringify(dto),
    },
    clientType
  );
}

/**
 * Get Minor Safety & Permission Controls
 */
export async function getSupervisionControls(
  minorId: string,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ controls: SupervisionControlItem[] }> {
  return apiFetch<{ controls: SupervisionControlItem[] }>(
    API_ENDPOINTS.SUPERVISION.CONTROLS(minorId),
    { method: 'GET' },
    clientType
  );
}

/**
 * Update Minor Safety Controls Batch (PUT /v1/supervision/:minorId/controls)
 */
export async function updateSupervisionControls(
  minorId: string,
  updates: Array<{ control: string; value: boolean | string }>,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ success: boolean; controls?: SupervisionControlItem[] }> {
  return apiFetch<{ success: boolean; controls?: SupervisionControlItem[] }>(
    API_ENDPOINTS.SUPERVISION.CONTROLS(minorId),
    {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    },
    clientType
  );
}

/**
 * Get Supervision Activity Logs
 */
export async function getSupervisionLogs(
  minorId: string,
  params?: { cursor?: string; limit?: number },
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ items: SupervisionLogItem[]; nextCursor?: string | null }> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<{ items: SupervisionLogItem[]; nextCursor?: string | null }>(
    `${API_ENDPOINTS.SUPERVISION.LOGS(minorId)}${queryString}`,
    { method: 'GET' },
    clientType
  );
}
