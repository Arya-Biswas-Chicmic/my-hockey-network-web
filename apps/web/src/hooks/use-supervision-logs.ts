'use client';

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { getSupervisionControls, getSupervisionLogs, type SupervisionControlItem, type SupervisionLogItem } from '@my-hockey-network/core';

import { extractErrorMessage } from '@/utils/toast';
import { useDebounce } from '@/hooks/use-debounce';

export interface ActivityLogView {
  id: string;
  dateTime: string;
  activity: string;
  initiatedBy: string;
  actionText: string;
}

type BooleanPermissions = Record<string, boolean | string>;

/**
 * Supervision > Logs tab. Extracted from `screens/supervision-page.tsx`.
 *
 * Note: the effect below re-fetches supervision controls via a second,
 * differently-shaped mapping (`c.control === 'VIEW_FEED'` raw string
 * checks) alongside fetching logs — this duplicates part of what
 * `use-supervision-permissions.ts`'s `fetchControlsForWard` already does
 * on ward selection. That redundancy predates this decomposition; it's
 * preserved as-is here rather than silently removed, since collapsing it
 * is a behavior change outside a decomposition/RHF-conversion pass.
 */
export function useSupervisionLogs(
  selectedWardId: string,
  setHomePermissions: Dispatch<SetStateAction<BooleanPermissions>>,
  setNetworkPermissions: Dispatch<SetStateAction<BooleanPermissions>>,
  setMessagingPermissions: Dispatch<SetStateAction<BooleanPermissions>>,
) {
  const [liveLogs, setLiveLogs] = useState<ActivityLogView[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [logsSearchQuery, setLogsSearchQuery] = useState('');
  const debouncedLogsSearchQuery = useDebounce(logsSearchQuery, 800);

  useEffect(() => {
    if (!selectedWardId) {
      setLiveLogs([]);
      return;
    }

    const isRealUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(selectedWardId);
    if (!isRealUuid) {
      setLiveLogs([]);
      return;
    }

    async function loadWardControlsAndLogs() {
      try {
        setIsLogsLoading(true);
        setLiveLogs([]);
        const controlsRes = await getSupervisionControls(selectedWardId);
        const controls = controlsRes.controls;
        if (Array.isArray(controls)) {
          controls.forEach((c: SupervisionControlItem) => {
            if (c.control === 'VIEW_FEED') setHomePermissions((prev) => ({ ...prev, viewFeed: !!c.value }));
            if (c.control === 'CREATE_POST') setHomePermissions((prev) => ({ ...prev, createPosts: !!c.value }));
            if (c.control === 'COMMENT_ON_POSTS') setHomePermissions((prev) => ({ ...prev, commentOnPosts: !!c.value }));
            if (c.control === 'REACT_TO_POSTS') setHomePermissions((prev) => ({ ...prev, reactToPosts: !!c.value }));
            if (c.control === 'SHARE_POSTS') setHomePermissions((prev) => ({ ...prev, sharePosts: !!c.value }));
            if (c.control === 'FOLLOW_OTHERS') setNetworkPermissions((prev) => ({ ...prev, followOthers: !!c.value }));
            if (c.control === 'ACCEPT_CONNECTIONS') setNetworkPermissions((prev) => ({ ...prev, acceptRequests: !!c.value }));
            if (c.control === 'WHO_CAN_FOLLOW') setNetworkPermissions((prev) => ({ ...prev, whoCanFollowThem: String(c.value) }));
            if (c.control === 'WHO_CAN_SEND_CONNECTION_REQUESTS') setNetworkPermissions((prev) => ({ ...prev, whoCanSendRequests: String(c.value) }));
            if (c.control === 'SEND_MESSAGES') setMessagingPermissions((prev) => ({ ...prev, sendMessages: !!c.value }));
            if (c.control === 'RECEIVE_MESSAGES') setMessagingPermissions((prev) => ({ ...prev, receiveMessages: !!c.value }));
            if (c.control === 'CREATE_GROUP_CHATS') setMessagingPermissions((prev) => ({ ...prev, createGroupChats: !!c.value }));
            if (c.control === 'WHO_CAN_MESSAGE_THEM') setMessagingPermissions((prev) => ({ ...prev, whoCanMessageThem: String(c.value) }));
          });
        }

        const logsRes = await getSupervisionLogs(selectedWardId);
        const logItems = logsRes.items ?? [];
        const mappedLogs = logItems.map((log: SupervisionLogItem) => ({
          id: log.id,
          dateTime: new Date(log.createdAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          activity: log.summary || log.eventType || 'Supervision activity log',
          initiatedBy: 'Parent',
          actionText: 'View',
        }));
        setLiveLogs(mappedLogs);
      } catch (err: unknown) {
        console.warn('❌ [SupervisionPage] Controls/Logs load notice:', extractErrorMessage(err));
      } finally {
        setIsLogsLoading(false);
      }
    }
    void loadWardControlsAndLogs();
  }, [selectedWardId]);

  const allLogs = liveLogs;

  const filteredLogs = allLogs.filter((log) => {
    if (!debouncedLogsSearchQuery.trim()) return true;
    const q = debouncedLogsSearchQuery.toLowerCase();
    return (
      (log.activity && log.activity.toLowerCase().includes(q)) ||
      (log.initiatedBy && log.initiatedBy.toLowerCase().includes(q)) ||
      (log.dateTime && log.dateTime.toLowerCase().includes(q))
    );
  });

  return { filteredLogs, logsSearchQuery, setLogsSearchQuery, isLogsLoading };
}
