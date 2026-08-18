import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';

export interface TargetEntity {
  type: 'USER' | 'PROFILE' | 'GROUP' | 'ORGANIZATION';
  id: string;
}

export interface Counterparty {
  type: string;
  id: string;
  profileId?: string | null;
  publicRef?: string | null;
  displayName: string;
  avatarUrl?: string | null;
  profileType?: string | null;
  primaryRole?: string | null;
  position?: string | null;
  jerseyNumber?: number | null;
  roleTag?: string | null;
  teamName?: string | null;
  teamLogo?: string | null;
  location?: string | null;
  isMinor?: boolean;
  verificationStatus?: string;
}

export interface RelationshipItem {
  id: string;
  sourceType?: string;
  sourceId?: string;
  targetType?: string;
  targetId?: string;
  type: string;
  status: string;
  requestedById?: string;
  requestReason?: string | null;
  approvedById?: string | null;
  approvedAt?: string | null;
  statusReason?: string | null;
  requiredParentApproval?: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt?: string;
  counterparty?: Counterparty | null;
  source?: TargetEntity;
  target?: TargetEntity;
}

/**
 * Follow a user, profile, or group
 */
export async function followUser(target: TargetEntity, clientType: 'web' | 'mobile' = 'web'): Promise<{ relationship: RelationshipItem; pendingGuardianApproval?: boolean }> {
  return apiFetch<{ relationship: RelationshipItem; pendingGuardianApproval?: boolean }>(API_ENDPOINTS.RELATIONSHIPS.FOLLOW, {
    method: 'POST',
    body: JSON.stringify({ target }),
  }, clientType);
}

/**
 * Send connection request
 */
export async function sendConnectionRequest(target: TargetEntity, reason?: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ relationship: RelationshipItem }> {
  return apiFetch<{ relationship: RelationshipItem }>(API_ENDPOINTS.RELATIONSHIPS.CONNECTIONS, {
    method: 'POST',
    body: JSON.stringify({ target, reason }),
  }, clientType);
}

/**
 * Fetch relationship lists (Followers, Connections, Pending Requests)
 */
export async function getRelationships(params?: { type?: string; status?: string; direction?: 'outgoing' | 'incoming' }, clientType: 'web' | 'mobile' = 'web'): Promise<{ items: RelationshipItem[] }> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.status) query.set('status', params.status);
  if (params?.direction) query.set('direction', params.direction);

  return apiFetch<{ items: RelationshipItem[] }>(`${API_ENDPOINTS.RELATIONSHIPS.BASE}?${query.toString()}`, { method: 'GET' }, clientType);
}

/**
 * Accept a relationship request
 */
export async function acceptRelationship(id: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ relationship: RelationshipItem }> {
  return apiFetch<{ relationship: RelationshipItem }>(`${API_ENDPOINTS.RELATIONSHIPS.BASE}/${id}/accept`, {
    method: 'POST',
  }, clientType);
}

/**
 * Decline a relationship request
 */
export async function declineRelationship(id: string, reason?: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ relationship: RelationshipItem }> {
  return apiFetch<{ relationship: RelationshipItem }>(`${API_ENDPOINTS.RELATIONSHIPS.BASE}/${id}/decline`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }, clientType);
}

/**
 * Send Guardian Invite (Parent -> Child)
 */
export async function sendGuardianInvite(childEmail: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_INVITES, {
    method: 'POST',
    body: JSON.stringify({ childEmail }),
  }, clientType);
}

/**
 * Get Pending Guardian Invites (for Child)
 */
export async function getPendingGuardianInvites(clientType: 'web' | 'mobile' = 'web'): Promise<{ items: any[] }> {
  return apiFetch<{ items: any[] }>(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_INVITES_PENDING, { method: 'GET' }, clientType);
}

/**
 * Accept Guardian Invite (Child enters 6-digit code)
 */
export async function acceptGuardianInvite(code: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_INVITES_ACCEPT, {
    method: 'POST',
    body: JSON.stringify({ code }),
  }, clientType);
}

/**
 * Fetch People You May Know recommendations
 */
export async function getPeopleYouMayKnow(limit = 10, clientType: 'web' | 'mobile' = 'web'): Promise<{ items: any[] }> {
  return apiFetch<{ items: any[] }>(`${API_ENDPOINTS.RECOMMENDATIONS.PEOPLE}?limit=${limit}`, { method: 'GET' }, clientType);
}

/**
 * Fetch Suggested People recommendations
 */
export async function getSuggestedPeople(params?: { profileType?: string; limit?: number }, clientType: 'web' | 'mobile' = 'web'): Promise<{ items: any[] }> {
  const query = new URLSearchParams();
  if (params?.profileType) query.set('profileType', params.profileType);
  if (params?.limit) query.set('limit', params.limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<{ items: any[] }>(`${API_ENDPOINTS.RECOMMENDATIONS.SUGGESTED}${queryString}`, { method: 'GET' }, clientType);
}
