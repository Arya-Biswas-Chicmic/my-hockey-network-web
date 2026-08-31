import { ClientTypeEnum, EntityTypeEnum, RelationshipDirectionEnum, RelationshipStatusEnum, RelationshipTypeEnum } from '@my-hockey-network/contracts';
import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';

export interface TargetEntity {
  type: EntityTypeEnum | 'USER' | 'PROFILE' | 'GROUP' | 'ORGANIZATION';
  id: string;
  displayName?: string;
  avatarUrl?: string | null;
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
  city?: string | null;
  isMinor?: boolean;
  verificationStatus?: string;
}

export interface RelationshipItem {
  id: string;
  sourceType?: string;
  sourceId?: string;
  targetType?: string;
  targetId?: string;
  type: RelationshipTypeEnum | string;
  status: RelationshipStatusEnum | string;
  requestedById?: string;
  requestReason?: string | null;
  approvedById?: string | null;
  approvedAt?: string | null;
  statusReason?: string | null;
  requiredParentApproval?: boolean;
  metadata?: unknown;
  createdAt: string;
  updatedAt?: string;
  counterparty?: Counterparty | null;
  source?: TargetEntity;
  target?: TargetEntity;
}

export interface GuardianRelationshipRequest {
  id: string;
  code?: string;
  status?: string;
  createdAt?: string;
  requester?: Counterparty;
  counterparty?: Counterparty;
  child?: Partial<Counterparty>;
  minor?: Partial<Counterparty>;
  displayName?: string;
  name?: string;
  avatarUrl?: string | null;
  roleTag?: string;
  devCode?: string;
  inviteCode?: string;
}

export interface RecommendedPerson extends Partial<Counterparty> {
  id: string;
  profileId?: string;
  name?: string;
  profile?: Partial<Counterparty> & { id?: string; name?: string };
}

/**
 * Follow a user, profile, or group
 */
export async function followUser(target: TargetEntity, clientType: ClientTypeEnum | 'web' | 'mobile' = ClientTypeEnum.WEB): Promise<{ relationship: RelationshipItem; pendingGuardianApproval?: boolean }> {
  return apiFetch<{ relationship: RelationshipItem; pendingGuardianApproval?: boolean }>(API_ENDPOINTS.RELATIONSHIPS.FOLLOW, {
    method: 'POST',
    body: JSON.stringify({ target }),
  }, clientType);
}

/**
 * Recover the relationship edge ID for a target profile ID (Step 2 in Tarun's backend spec)
 */
export async function findRelationshipEdgeId(
  targetProfileId: string,
  clientType: ClientTypeEnum | 'web' | 'mobile' = ClientTypeEnum.WEB
): Promise<string | null> {
  try {
    const res = await getRelationships({ type: RelationshipTypeEnum.FOLLOW, direction: RelationshipDirectionEnum.OUTGOING }, clientType);
    const items = res.items;

    const found = items.find((item) => {
      const targetId = item.targetId || item.target?.id;
      const counterpartyId = item.counterparty?.id;
      const sourceId = item.sourceId || item.source?.id;
      return (
        targetId === targetProfileId ||
        counterpartyId === targetProfileId ||
        sourceId === targetProfileId ||
        item.id === targetProfileId
      );
    });

    return found?.id || null;
  } catch {
    return null;
  }
}

/**
 * Remove / Revoke a relationship via DELETE /v1/relationships/:id (unfollow / remove)
 */
export async function removeRelationship(relationshipId: string, clientType: ClientTypeEnum | 'web' | 'mobile' = ClientTypeEnum.WEB): Promise<{ message?: string; success?: boolean }> {
  return apiFetch<{ message?: string; success?: boolean }>(`${API_ENDPOINTS.RELATIONSHIPS.BASE}/${relationshipId}`, {
    method: 'DELETE',
  }, clientType);
}

/**
 * Unfollow a user, profile, or group:
 * 1. If edge ID is known, call DELETE /v1/relationships/:edgeId directly.
 * 2. If profile ID is provided, look up edge ID via GET /v1/relationships?type=FOLLOW&direction=outgoing, then call DELETE /v1/relationships/:edgeId.
 */
export async function unfollowUser(
  targetOrRelationshipId: string | TargetEntity,
  clientType: ClientTypeEnum | 'web' | 'mobile' = ClientTypeEnum.WEB
): Promise<{ message?: string; success?: boolean }> {
  const targetId = typeof targetOrRelationshipId === 'string'
    ? targetOrRelationshipId
    : targetOrRelationshipId.id;

  try {
    const recoveredEdgeId = await findRelationshipEdgeId(targetId, clientType);
    const finalEdgeId = recoveredEdgeId || targetId;

    return await removeRelationship(finalEdgeId, clientType);
  } catch {
    const targetObj = typeof targetOrRelationshipId === 'string'
      ? { type: EntityTypeEnum.PROFILE, id: targetId }
      : targetOrRelationshipId;

    return await apiFetch<{ message?: string; success?: boolean }>(API_ENDPOINTS.RELATIONSHIPS.FOLLOW, {
      method: 'POST',
      body: JSON.stringify({ target: targetObj }),
    }, clientType);
  }
}

/**
 * Send connection request
 */
export async function sendConnectionRequest(target: TargetEntity, reason?: string, clientType: ClientTypeEnum | 'web' | 'mobile' = ClientTypeEnum.WEB): Promise<{ relationship: RelationshipItem }> {
  return apiFetch<{ relationship: RelationshipItem }>(API_ENDPOINTS.RELATIONSHIPS.CONNECTIONS, {
    method: 'POST',
    body: JSON.stringify({ target, reason }),
  }, clientType);
}

/**
 * Fetch relationship lists (Followers, Connections, Pending Requests)
 */
export async function getRelationships(
  params?: { type?: RelationshipTypeEnum | string; status?: RelationshipStatusEnum | string; direction?: RelationshipDirectionEnum | 'outgoing' | 'incoming'; query?: string; q?: string },
  clientType: ClientTypeEnum | 'web' | 'mobile' = ClientTypeEnum.WEB
): Promise<{ items: RelationshipItem[] }> {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.set('type', params.type);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.direction) queryParams.set('direction', params.direction);

  const searchTerm = params?.query || params?.q;
  if (searchTerm && searchTerm.trim().length >= 2) {
    queryParams.set('query', searchTerm.trim());
    queryParams.set('q', searchTerm.trim());
  }

  return apiFetch<{ items: RelationshipItem[] }>(`${API_ENDPOINTS.RELATIONSHIPS.BASE}?${queryParams.toString()}`, { method: 'GET' }, clientType);
}

/**
 * Accept a relationship request
 */
export async function acceptRelationship(id: string, clientType: ClientTypeEnum | 'web' | 'mobile' = ClientTypeEnum.WEB): Promise<{ relationship: RelationshipItem }> {
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
export async function getPendingGuardianInvites(clientType: 'web' | 'mobile' = 'web'): Promise<{ invites: GuardianRelationshipRequest[] }> {
  return apiFetch<{ invites: GuardianRelationshipRequest[] }>(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_INVITES_PENDING, { method: 'GET' }, clientType);
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
 * Decline Guardian Invite (Child declines invite code)
 */
export async function declineGuardianInvite(code: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_INVITES_DECLINE, {
    method: 'POST',
    body: JSON.stringify({ code }),
  }, clientType);
}

/**
 * Get Pending Guardian Requests (for Adult)
 */
export async function getPendingGuardianRequests(clientType: 'web' | 'mobile' = 'web'): Promise<{ items: GuardianRelationshipRequest[] }> {
  return apiFetch<{ items: GuardianRelationshipRequest[] }>(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_REQUESTS_PENDING, { method: 'GET' }, clientType);
}

/**
 * Accept Guardian Request (Adult accepts 6-digit code)
 */
export async function acceptGuardianRequest(code: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_REQUESTS_ACCEPT, {
    method: 'POST',
    body: JSON.stringify({ code }),
  }, clientType);
}

/**
 * Decline Guardian Request (Adult declines request)
 */
export async function declineGuardianRequest(code: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_REQUESTS_DECLINE, {
    method: 'POST',
    body: JSON.stringify({ code }),
  }, clientType);
}

/**
 * Send Contact Request (POST /v1/relationships/contact-requests)
 */
export async function sendContactRequest(target: TargetEntity, reason: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ relationship: RelationshipItem }> {
  return apiFetch<{ relationship: RelationshipItem }>(API_ENDPOINTS.RELATIONSHIPS.CONTACT_REQUESTS, {
    method: 'POST',
    body: JSON.stringify({ target, reason }),
  }, clientType);
}

/**
 * Send Affiliation Request (POST /v1/relationships/affiliations)
 */
export async function sendAffiliation(source: TargetEntity, target: TargetEntity, reason?: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ relationship: RelationshipItem }> {
  return apiFetch<{ relationship: RelationshipItem }>(API_ENDPOINTS.RELATIONSHIPS.AFFILIATIONS, {
    method: 'POST',
    body: JSON.stringify({ source, target, reason }),
  }, clientType);
}

/**
 * Block User / Entity (POST /v1/relationships/blocks)
 */
export async function blockUser(target: TargetEntity, reason?: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(API_ENDPOINTS.RELATIONSHIPS.BLOCKS, {
    method: 'POST',
    body: JSON.stringify({ target, reason }),
  }, clientType);
}

/**
 * Unblock User / Entity (DELETE /v1/relationships/blocks/:id)
 */
export async function unblockUser(blockId: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`${API_ENDPOINTS.RELATIONSHIPS.BLOCKS}/${blockId}`, {
    method: 'DELETE',
  }, clientType);
}

/**
 * Fetch People You May Know recommendations
 */
export async function getPeopleYouMayKnow(
  params?: number | { limit?: number; query?: string; q?: string },
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ items: RecommendedPerson[] }> {
  const queryParams = new URLSearchParams();
  let limitVal = 10;
  if (typeof params === 'number') {
    limitVal = params;
  } else if (params && typeof params === 'object') {
    limitVal = params.limit || 10;
    const searchTerm = params.query || params.q;
    if (searchTerm && searchTerm.trim().length >= 2) {
      queryParams.set('query', searchTerm.trim());
      queryParams.set('q', searchTerm.trim());
    }
  }
  queryParams.set('limit', String(limitVal));
  return apiFetch<{ items: RecommendedPerson[] }>(`${API_ENDPOINTS.RECOMMENDATIONS.PEOPLE}?${queryParams.toString()}`, { method: 'GET' }, clientType);
}

/**
 * Fetch Suggested People recommendations
 */
export async function getSuggestedPeople(params?: { profileType?: string; limit?: number }, clientType: 'web' | 'mobile' = 'web'): Promise<{ items: RecommendedPerson[] }> {
  const query = new URLSearchParams();
  if (params?.profileType) query.set('profileType', params.profileType);
  if (params?.limit) query.set('limit', params.limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<{ items: RecommendedPerson[] }>(`${API_ENDPOINTS.RECOMMENDATIONS.SUGGESTED}${queryString}`, { method: 'GET' }, clientType);
}
