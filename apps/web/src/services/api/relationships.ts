import { apiFetch } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export async function acceptGuardianRequest(code: string) {
  return apiFetch(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_REQUESTS_ACCEPT, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function declineGuardianRequest(code: string) {
  return apiFetch(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_REQUESTS_DECLINE, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function getPendingGuardianRequests() {
  return apiFetch(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_REQUESTS_PENDING, {
    method: 'GET',
  });
}
