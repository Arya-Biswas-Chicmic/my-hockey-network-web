import {
  API_ENDPOINTS,
  CareerEntry,
  CreateCareerEntryDto,
  UpdateCareerEntryDto,
  ProfileReadResponse,
} from '@my-hockey-network/contracts';
import { apiFetch } from './client';

/**
 * Read profile including embedded careerEntries array (GET /v1/profiles/:profileId)
 */
export async function getProfile(
  profileId: string,
  clientType: 'web' | 'mobile' = 'web'
): Promise<ProfileReadResponse> {
  return apiFetch<ProfileReadResponse>(
    API_ENDPOINTS.PROFILES.GET_PROFILE(profileId),
    { method: 'GET' },
    clientType
  );
}

/**
 * Create a new career entry for the logged-in user (POST /v1/profiles/me/career)
 * Requires groupId OR teamName.
 */
export async function createCareerEntry(
  dto: CreateCareerEntryDto,
  clientType: 'web' | 'mobile' = 'web'
): Promise<CareerEntry> {
  const cleanedPayload: Record<string, any> = {};
  Object.keys(dto).forEach((key) => {
    const val = (dto as any)[key];
    if (val !== null && val !== undefined && val !== '') {
      cleanedPayload[key] = val;
    }
  });

  return apiFetch<CareerEntry>(
    API_ENDPOINTS.PROFILES.CAREER,
    {
      method: 'POST',
      body: JSON.stringify(cleanedPayload),
    },
    clientType
  );
}

/**
 * Update an existing career entry (PATCH /v1/profiles/me/career/:id)
 * Sparse update - send only changed fields.
 */
export async function updateCareerEntry(
  id: string,
  dto: UpdateCareerEntryDto,
  clientType: 'web' | 'mobile' = 'web'
): Promise<CareerEntry> {
  const cleanedPayload: Record<string, any> = {};
  Object.keys(dto).forEach((key) => {
    const val = (dto as any)[key];
    if (val !== undefined && val !== '') {
      cleanedPayload[key] = val;
    }
  });

  return apiFetch<CareerEntry>(
    API_ENDPOINTS.PROFILES.CAREER_ITEM(id),
    {
      method: 'PATCH',
      body: JSON.stringify(cleanedPayload),
    },
    clientType
  );
}

/**
 * Delete a career entry (DELETE /v1/profiles/me/career/:id)
 * Soft deletes the entry immediately.
 */
export async function deleteCareerEntry(
  id: string,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(
    API_ENDPOINTS.PROFILES.CAREER_ITEM(id),
    { method: 'DELETE' },
    clientType
  );
}
