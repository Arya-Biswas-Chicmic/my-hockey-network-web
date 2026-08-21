import { apiFetch } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export async function getSupervisionData() {
  return apiFetch(API_ENDPOINTS.SUPERVISION.BASE, {
    method: 'GET',
  });
}

export async function createManagedChild(dto: any) {
  return apiFetch(API_ENDPOINTS.SUPERVISION.CHILDREN, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function getSupervisionControls(minorId: string) {
  return apiFetch(API_ENDPOINTS.SUPERVISION.CONTROLS(minorId), {
    method: 'GET',
  });
}

export async function updateSupervisionControls(minorId: string, controls: any) {
  return apiFetch(API_ENDPOINTS.SUPERVISION.CONTROLS(minorId), {
    method: 'PUT',
    body: JSON.stringify(controls),
  });
}

export async function getSupervisionLogs(minorId: string) {
  return apiFetch(API_ENDPOINTS.SUPERVISION.LOGS(minorId), {
    method: 'GET',
  });
}
