import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';

export interface CreateGroupDTO {
  name: string;
  type?: 'TEAM' | 'PRIVATE';
  description?: string;
  organizationId?: string;
  ageGroup?: string;
  genderCategory?: string;
  season?: string;
  visibility?: string;
  requirePostApproval?: boolean;
  allowMemberInvites?: boolean;
  anyoneCanPost?: boolean;
}

export interface GroupItem {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  organizationId?: string | null;
  memberCount?: number;
  visibility?: string;
  anyoneCanPost?: boolean;
  requirePostApproval?: boolean;
  allowMemberInvites?: boolean;
  createdAt: string;
}

export interface GroupMemberItem {
  id: string;
  groupId: string;
  profileId: string;
  role: string;
  status: string;
  joinedAt: string;
  profile?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export interface GroupFileItem {
  id: string;
  groupId: string;
  name: string;
  storageKey: string;
  mimeType?: string;
  sizeBytes?: number;
  description?: string;
  createdAt: string;
}

/**
 * Fetch Groups (Mine or Discover)
 */
export async function getGroups(
  params?: { scope?: 'mine' | 'discover'; search?: string; type?: string; cursor?: string; limit?: number },
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ items: GroupItem[]; nextCursor?: string | null }> {
  const query = new URLSearchParams();
  if (params?.scope) query.set('scope', params.scope);
  if (params?.search) query.set('search', params.search);
  if (params?.type) query.set('type', params.type);
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<{ items: GroupItem[]; nextCursor?: string | null }>(
    `${API_ENDPOINTS.GROUPS.BASE}${queryString}`,
    { method: 'GET' },
    clientType
  );
}

/**
 * Get Group Details by ID
 */
export async function getGroupById(id: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ group: GroupItem }> {
  return apiFetch<{ group: GroupItem }>(API_ENDPOINTS.GROUPS.GET_GROUP(id), { method: 'GET' }, clientType);
}

/**
 * Create a new Group (TEAM or PRIVATE)
 */
export async function createGroup(dto: CreateGroupDTO, clientType: 'web' | 'mobile' = 'web'): Promise<{ group: GroupItem }> {
  return apiFetch<{ group: GroupItem }>(
    API_ENDPOINTS.GROUPS.BASE,
    {
      method: 'POST',
      body: JSON.stringify(dto),
    },
    clientType
  );
}

/**
 * Join Group (Child/User asks to join) -> Kernel action: JOIN_TEAM
 */
export async function joinGroup(
  id: string,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ member: GroupMemberItem; pendingGuardianApproval?: boolean }> {
  return apiFetch<{ member: GroupMemberItem; pendingGuardianApproval?: boolean }>(
    API_ENDPOINTS.GROUPS.JOIN(id),
    { method: 'POST' },
    clientType
  );
}

/**
 * Leave Group
 */
export async function leaveGroup(id: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(API_ENDPOINTS.GROUPS.LEAVE(id), { method: 'POST' }, clientType);
}

/**
 * Get Group Members
 */
export async function getGroupMembers(
  id: string,
  params?: { role?: string; status?: string; search?: string; cursor?: string; limit?: number },
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ items: GroupMemberItem[]; nextCursor?: string | null }> {
  const query = new URLSearchParams();
  if (params?.role) query.set('role', params.role);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<{ items: GroupMemberItem[]; nextCursor?: string | null }>(
    `${API_ENDPOINTS.GROUPS.MEMBERS(id)}${queryString}`,
    { method: 'GET' },
    clientType
  );
}

/**
 * Add Group Member (Team adds a player/member) -> Kernel action: ADDED_TO_ROSTER
 */
export async function addGroupMember(
  groupId: string,
  profileId: string,
  role?: string,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ member: GroupMemberItem; pendingGuardianApproval?: boolean }> {
  return apiFetch<{ member: GroupMemberItem; pendingGuardianApproval?: boolean }>(
    API_ENDPOINTS.GROUPS.MEMBERS(groupId),
    {
      method: 'POST',
      body: JSON.stringify({ profileId, role }),
    },
    clientType
  );
}

/**
 * Approve Group Member
 */
export async function approveGroupMember(
  groupId: string,
  memberId: string,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ member: GroupMemberItem }> {
  return apiFetch<{ member: GroupMemberItem }>(
    API_ENDPOINTS.GROUPS.APPROVE_MEMBER(groupId, memberId),
    { method: 'POST' },
    clientType
  );
}

/**
 * Register Group File
 */
export async function registerGroupFile(
  groupId: string,
  fileData: { name: string; storageKey: string; mimeType?: string; sizeBytes?: number; description?: string },
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ file: GroupFileItem }> {
  return apiFetch<{ file: GroupFileItem }>(
    API_ENDPOINTS.GROUPS.FILES(groupId),
    {
      method: 'POST',
      body: JSON.stringify(fileData),
    },
    clientType
  );
}
