import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';

export interface NotificationSettingItem {
  key: 'MESSAGE' | 'CONNECTION_REQUEST' | 'ACTIVITY' | 'MENTION' | 'GROUP' | string;
  enabled: boolean;
}

export interface NotificationSettingsDTO {
  items?: NotificationSettingItem[];
  messageNotifications?: boolean;
  connectionRequestNotifications?: boolean;
  activityNotifications?: boolean;
  mentionNotifications?: boolean;
  groupNotifications?: boolean;
}

export interface BlockedCounterpartyDTO {
  type?: string;
  id?: string;
  profileId?: string;
  displayName?: string;
  avatarUrl?: string | null;
  profileType?: string;
  primaryRole?: string;
  position?: string | null;
  jerseyNumber?: number | null;
  roleTag?: string;
  teamName?: string;
  teamLogo?: string;
  location?: string;
  isMinor?: boolean;
  verificationStatus?: string;
}

export interface BlockedUserDTO {
  id: string;
  sourceType?: string;
  sourceId?: string;
  targetType?: string;
  targetId?: string;
  type?: string;
  status?: string;
  statusReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  counterparty?: BlockedCounterpartyDTO;
  // Flattened fallbacks
  displayName?: string;
  name?: string;
  roleTag?: string;
  avatarUrl?: string | null;
  teamName?: string;
  teamLogo?: string;
  location?: string;
}

/**
 * Get Notification Settings (GET /v1/settings/notifications)
 */
export async function getNotificationSettings(
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ items: NotificationSettingItem[] }> {
  const res = await apiFetch<any>(
    API_ENDPOINTS.SETTINGS.NOTIFICATIONS,
    { method: 'GET' },
    clientType
  );
  const items = res?.data?.items || res?.items || [];
  return { items };
}

/**
 * Update Notification Settings (PUT /v1/settings/notifications)
 * Sends exact backend payload: { items: [{ key, enabled }] }
 */
export async function updateNotificationSettings(
  items: NotificationSettingItem[],
  clientType: 'web' | 'mobile' = 'web'
): Promise<any> {
  return apiFetch<any>(
    API_ENDPOINTS.SETTINGS.NOTIFICATIONS,
    {
      method: 'PUT',
      body: JSON.stringify({ items }),
    },
    clientType
  );
}

/**
 * Get Blocked Users (GET /v1/settings/blocked)
 */
export async function getBlockedUsersSettings(
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ items: BlockedUserDTO[] }> {
  const res = await apiFetch<any>(
    API_ENDPOINTS.SETTINGS.BLOCKED,
    { method: 'GET' },
    clientType
  );
  const items = res?.data?.items || res?.items || res?.blockedUsers || [];
  return { items };
}
