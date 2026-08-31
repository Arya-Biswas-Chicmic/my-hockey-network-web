"use client";

import { useState, useMemo } from "react";
import {
  getSupervisionLogs,
  type SupervisionLogItem,
} from "@my-hockey-network/core";
import { QueryKeys } from "@my-hockey-network/contracts";

import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@/query";

export interface ActivityLogView {
  id: string;
  dateTime: string;
  activity: string;
  initiatedBy: string;
  actionText: string;
}

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function formatLogActivity(log: SupervisionLogItem): string {
  const type = log.type;
  const params = log.params || {};

  switch (type) {
    case "PROFILE_UPDATED": {
      const fields = Array.isArray(params.fields) ? params.fields : [];
      if (fields.length > 0) {
        return `Updated profile fields: ${fields.join(", ")}`;
      }
      return "Updated profile details";
    }
    case "APPROVAL_DECIDED": {
      const action = params.action || "";
      const status = params.status || "DECIDED";
      const statusText = status.toLowerCase();
      if (action === "RECEIVE_CONNECTION_REQUEST") {
        return `${statusText === "approved" ? "Approved" : "Declined"} connection request`;
      }
      if (action === "SET_PUBLIC_PROFILE") {
        return `${statusText === "approved" ? "Approved" : "Declined"} post publication`;
      }
      return `${statusText === "approved" ? "Approved" : "Declined"} action request`;
    }
    case "CONNECTION_REQUEST_RECEIVED":
      return "Received a connection request";
    case "PROFILE_VISIBILITY_CHANGED":
      return "Changed profile visibility";
    default:
      return type
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

/**
 * Supervision > Logs tab. Extracted from `screens/supervision-page.tsx`.
 *
 * Fetches logs for the selected ward via `useQuery`. Controls are fetched
 * separately by `use-supervision-permissions.ts` and are not duplicated here.
 */
export function useSupervisionLogs(selectedWardId: string) {
  const [logsSearchQuery, setLogsSearchQuery] = useState("");

  const isRealUuid = UUID_RE.test(selectedWardId ?? "");
  const queryEnabled = Boolean(selectedWardId) && isRealUuid;

  const logsQuery = useQuery(
    queryEnabled ? `${QueryKeys.SUPERVISION_LOGS}:${selectedWardId}` : null,
    queryEnabled ? () => getSupervisionLogs(selectedWardId) : null,
    { staleTime: 30 * 1000, enabled: queryEnabled },
  );

  const debouncedLogsSearchQuery = useDebounce(logsSearchQuery, 800);
  const logItems = logsQuery.data?.items ?? [];
  const hasMore = !!logsQuery.data?.hasMore;
  const isLogsLoading = logsQuery.isLoading;

  const mappedLogs: ActivityLogView[] = useMemo(
    () =>
      logItems.map((log: SupervisionLogItem) => ({
        id: log.id,
        dateTime: new Date(log.createdAt).toLocaleString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        activity: formatLogActivity(log),
        initiatedBy: log.actorDisplayName || log.actorRoleLabel || "Parent",
        actionText: "View",
      })),
    [logItems],
  );

  const filteredLogs = useMemo(() => {
    if (!debouncedLogsSearchQuery.trim()) return mappedLogs;
    const q = debouncedLogsSearchQuery.toLowerCase();
    return mappedLogs.filter(
      (log) =>
        (log.activity && log.activity.toLowerCase().includes(q)) ||
        (log.initiatedBy && log.initiatedBy.toLowerCase().includes(q)) ||
        (log.dateTime && log.dateTime.toLowerCase().includes(q)),
    );
  }, [mappedLogs, debouncedLogsSearchQuery]);

  return {
    filteredLogs,
    logsSearchQuery,
    setLogsSearchQuery,
    isLogsLoading,
    hasMore,
  };
}
