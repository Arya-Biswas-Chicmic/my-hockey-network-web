import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';

export interface CreateManagedChildDTO {
  displayName: string;
  firstName: string;
  lastName?: string;
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
  name?: string;
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
 * Strips empty strings (""), null, or undefined fields from an object before sending payload
 */
export function cleanEmptyFields<T extends object>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key as keyof T] = value;
    }
  }
  return result;
}

/**
 * Format any date string (DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD) into ISO format YYYY-MM-DD
 */
export function formatDobToIso(dob: string): string {
  if (!dob) return '';
  const trimmed = dob.trim();
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  // DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[\/\-]/);
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
  }
  // YYYY/MM/DD
  if (/^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/.test(trimmed)) {
    const parts = trimmed.split(/[\/\-]/);
    const [yyyy, mm, dd] = parts;
    return `${yyyy}-${mm}-${dd}`;
  }
  return trimmed;
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
): Promise<{ child: SupervisionChildItem; profile?: SupervisionChildItem }> {
  const formattedDto: CreateManagedChildDTO = {
    ...dto,
    dateOfBirth: formatDobToIso(dto.dateOfBirth),
  };

  const cleanedPayload = cleanEmptyFields(formattedDto);

  const res = await apiFetch<Record<string, unknown>>(
    API_ENDPOINTS.SUPERVISION.CHILDREN,
    {
      method: 'POST',
      body: JSON.stringify(cleanedPayload),
    },
    clientType
  );

  const dataObj = (typeof res === 'object' && res !== null && 'data' in res ? res.data : undefined) as Record<string, unknown> | undefined;
  const childObj = ((res?.child || res?.profile || dataObj?.child || dataObj?.profile || res) || {}) as SupervisionChildItem;

  return {
    child: childObj,
    profile: childObj,
    ...(typeof res === 'object' && res !== null ? res : {}),
  };
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

export interface SupervisionPermissionsResponse {
  controlsMap: Record<string, boolean | string>;
  raw: unknown;
}

interface SupervisionPermissionItem {
  control?: string;
  name?: string;
  value: boolean | string;
}

interface SupervisionPermissionsPayload {
  controls?: SupervisionPermissionItem[];
  data?: { controls?: SupervisionPermissionItem[] };
}

/**
 * Fetch Supervision Permissions for the logged-in minor player (GET /v1/supervision/me/permissions)
 * Note: Only called for minor players / wards, NOT for parent or coach roles.
 */
export async function getMySupervisionPermissions(
  clientType: 'web' | 'mobile' = 'web'
): Promise<SupervisionPermissionsResponse> {
  try {
    const res = await apiFetch<SupervisionPermissionsPayload>(
      API_ENDPOINTS.SUPERVISION.MY_PERMISSIONS,
      { method: 'GET' },
      clientType
    );

    const controlsList = res?.controls || res?.data?.controls || [];
    const controlsMap: Record<string, boolean | string> = {};

    if (Array.isArray(controlsList)) {
      controlsList.forEach((item) => {
        const key = item.control || item.name;
        if (key) {
          controlsMap[key] = item.value;
        }
      });
    }

    return {
      controlsMap,
      raw: res,
    };
  } catch {
    return {
      controlsMap: {},
      raw: null,
    };
  }
}
