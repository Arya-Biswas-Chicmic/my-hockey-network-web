'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAlerts,
  getUnreadAlertCount,
  markAlertAsRead,
  markAllAlertsAsRead,
  type AlertItem,
} from '@my-hockey-network/core';
import { QueryKeys } from '@my-hockey-network/contracts';

/** Notifications page. Backed by the `/alerts` endpoint (`packages/core`'s `alertsApi`). */
export function useAlertsQuery(unreadOnly: boolean) {
  return useQuery<{ items: AlertItem[]; nextCursor?: string | null }>({
    queryKey: [QueryKeys.ALERTS_LIST, unreadOnly],
    queryFn: () => getAlerts({ unreadOnly: unreadOnly || undefined }),
    staleTime: 30_000,
  });
}

export function useUnreadAlertCountQuery() {
  return useQuery({
    queryKey: [QueryKeys.ALERTS_UNREAD_COUNT],
    queryFn: () => getUnreadAlertCount(),
    staleTime: 30_000,
  });
}

function invalidateAlerts(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: [QueryKeys.ALERTS_LIST] });
  void queryClient.invalidateQueries({ queryKey: [QueryKeys.ALERTS_UNREAD_COUNT] });
}

export function useMarkAlertReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAlertAsRead(id),
    onSuccess: () => invalidateAlerts(queryClient),
  });
}

export function useMarkAllAlertsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (section?: string) => markAllAlertsAsRead(section),
    onSuccess: () => invalidateAlerts(queryClient),
  });
}
