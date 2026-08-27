'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBlockedUsersSettings,
  getNotificationSettings,
  updateNotificationSettings,
  removeRelationship,
  type BlockedUserDTO,
  type NotificationSettingItem,
} from '@my-hockey-network/core';
import { QueryKeys } from '@my-hockey-network/contracts';

export interface BlockedUserView {
  id: string;
  name: string;
  roleTag: string;
  avatarUrl: string;
  teamName: string;
  teamLogo: string;
  location: string;
}

function mapBlockedUser(b: BlockedUserDTO): BlockedUserView {
  const cp = b.counterparty || b;
  return {
    id: b.id || b.targetId || cp.id || 'unknown',
    name: cp.displayName || cp.name || 'Blocked User',
    roleTag: cp.roleTag || (cp.position ? `${cp.position} ${cp.jerseyNumber ? `• #${cp.jerseyNumber}` : ''}` : cp.primaryRole || 'Player'),
    avatarUrl: cp.avatarUrl || '/userPlaceholder.png',
    teamName: cp.teamName || '',
    teamLogo: cp.teamLogo || '',
    location: cp.location || cp.city || '',
  };
}

/** Settings > Blocked Users tab. Extracted from `screens/settings-page.tsx`. */
export function useBlockedUsersQuery() {
  return useQuery<BlockedUserView[]>({
    queryKey: [QueryKeys.SETTINGS_BLOCKED_USERS],
    queryFn: async () => {
      const res = await getBlockedUsersSettings();
      return (res?.items ?? []).map(mapBlockedUser);
    },
    staleTime: 60_000,
  });
}

export function useUnblockUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeRelationship(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.SETTINGS_BLOCKED_USERS] });
    },
  });
}

export interface NotificationSettingsView {
  message: boolean;
  connectionRequest: boolean;
  activity: boolean;
  mention: boolean;
  group: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsView = {
  message: true,
  connectionRequest: true,
  activity: false,
  mention: true,
  group: true,
};

const NOTIFICATION_KEY_MAP: Record<string, keyof NotificationSettingsView> = {
  MESSAGE: 'message',
  CONNECTION_REQUEST: 'connectionRequest',
  ACTIVITY: 'activity',
  MENTION: 'mention',
  GROUP: 'group',
};

/** Settings > Notification tab. Extracted from `screens/settings-page.tsx`. */
export function useNotificationSettingsQuery() {
  return useQuery<NotificationSettingsView>({
    queryKey: [QueryKeys.SETTINGS_NOTIFICATIONS],
    queryFn: async () => {
      const res = await getNotificationSettings();
      const view = { ...DEFAULT_NOTIFICATION_SETTINGS };
      (res.items ?? []).forEach((item: NotificationSettingItem) => {
        const viewKey = NOTIFICATION_KEY_MAP[item.key];
        if (viewKey) view[viewKey] = Boolean(item.enabled);
      });
      return view;
    },
    staleTime: 60_000,
  });
}

export function useUpdateNotificationSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: NotificationSettingsView) =>
      updateNotificationSettings([
        { key: 'MESSAGE', enabled: settings.message },
        { key: 'CONNECTION_REQUEST', enabled: settings.connectionRequest },
        { key: 'ACTIVITY', enabled: settings.activity },
        { key: 'MENTION', enabled: settings.mention },
        { key: 'GROUP', enabled: settings.group },
      ]),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.SETTINGS_NOTIFICATIONS] });
    },
  });
}
