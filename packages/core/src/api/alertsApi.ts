import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';

export interface AlertItem {
  id: string;
  section: 'NEEDS_REVIEW' | 'ACTIVITY' | 'SYSTEM' | 'SOCIAL';
  category?: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface UnreadAlertCountResponse {
  total: number;
  NEEDS_REVIEW?: number;
  ACTIVITY?: number;
  SYSTEM?: number;
  SOCIAL?: number;
  [key: string]: number | undefined;
}

/**
 * Get User Alerts / Notifications List
 */
export async function getAlerts(
  params?: { section?: string; unreadOnly?: boolean; cursor?: string; limit?: number },
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ items: AlertItem[]; nextCursor?: string | null }> {
  const query = new URLSearchParams();
  if (params?.section) query.set('section', params.section);
  if (params?.unreadOnly !== undefined) query.set('unreadOnly', String(params.unreadOnly));
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<{ items: AlertItem[]; nextCursor?: string | null }>(
    `${API_ENDPOINTS.ALERTS.BASE}${queryString}`,
    { method: 'GET' },
    clientType
  );
}

/**
 * Get Unread Alert Counts per section (GET /v1/alerts/unread-count)
 */
export async function getUnreadAlertCount(clientType: 'web' | 'mobile' = 'web'): Promise<UnreadAlertCountResponse> {
  return apiFetch<UnreadAlertCountResponse>(
    API_ENDPOINTS.ALERTS.UNREAD_COUNT,
    { method: 'GET' },
    clientType
  );
}

/**
 * Mark Single Alert as Read (POST /v1/alerts/:id/read)
 */
export async function markAlertAsRead(id: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    API_ENDPOINTS.ALERTS.READ(id),
    { method: 'POST' },
    clientType
  );
}

/**
 * Mark All Alerts as Read (POST /v1/alerts/read-all)
 */
export async function markAllAlertsAsRead(section?: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    API_ENDPOINTS.ALERTS.READ_ALL,
    {
      method: 'POST',
      body: JSON.stringify({ section }),
    },
    clientType
  );
}
