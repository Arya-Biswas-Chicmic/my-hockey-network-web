import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';

export interface CreateOrganizationDTO {
  name: string;
  type: 'TOP_LEVEL_BODY' | 'ASSOCIATION' | 'PARTNER';
  slug?: string;
  jurisdiction?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  parentOrganizationId?: string;
}

export interface OrganizationItem {
  id: string;
  name: string;
  type: string;
  slug?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  parentOrganizationId?: string | null;
  createdAt: string;
}

/**
 * Fetch Organizations
 */
export async function getOrganizations(
  params?: { type?: string; search?: string; parentOrganizationId?: string; cursor?: string; limit?: number },
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ items: OrganizationItem[]; nextCursor?: string | null }> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.search) query.set('search', params.search);
  if (params?.parentOrganizationId) query.set('parentOrganizationId', params.parentOrganizationId);
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<{ items: OrganizationItem[]; nextCursor?: string | null }>(
    `${API_ENDPOINTS.ORGANIZATIONS.BASE}${queryString}`,
    { method: 'GET' },
    clientType
  );
}

/**
 * Get Organization by ID
 */
export async function getOrganizationById(id: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ organization: OrganizationItem }> {
  return apiFetch<{ organization: OrganizationItem }>(
    API_ENDPOINTS.ORGANIZATIONS.GET_ORG(id),
    { method: 'GET' },
    clientType
  );
}

/**
 * Create Organization (ASSOCIATION_ADMIN)
 */
export async function createOrganization(
  dto: CreateOrganizationDTO,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ organization: OrganizationItem }> {
  return apiFetch<{ organization: OrganizationItem }>(
    API_ENDPOINTS.ORGANIZATIONS.BASE,
    {
      method: 'POST',
      body: JSON.stringify(dto),
    },
    clientType
  );
}

/**
 * Update Organization
 */
export async function updateOrganization(
  id: string,
  dto: Partial<CreateOrganizationDTO>,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ organization: OrganizationItem }> {
  return apiFetch<{ organization: OrganizationItem }>(
    API_ENDPOINTS.ORGANIZATIONS.GET_ORG(id),
    {
      method: 'PATCH',
      body: JSON.stringify(dto),
    },
    clientType
  );
}
