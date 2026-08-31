"use client";

import { Button } from "@/components/common/Button";
import { NoDataFound } from "@/components/common/no-data-found";
import { GuardianRequestSkeleton } from "@/components/supervision/guardian-request-skeleton";
import { SupervisionRequestRow } from "@/components/supervision/supervision-request-row";
import { resolveMediaUrl } from "@/utils/mediaUtils";
import type { PendingSupervisionRequest } from "@/hooks/use-supervision-requests";
import type { UseQueryResult } from "@tanstack/react-query";
import type { GuardianRelationshipRequest } from "@my-hockey-network/core";
import {
  getGuardianRequestCode,
  getGuardianRequestName,
  GuardianRelationshipRequestCard,
} from "@/components/supervision/guardian-relationship-request-card";
import { showInfoToast } from "@/utils/toast";
import { REGEX_PATTERNS } from "@my-hockey-network/constants";

export interface ProfileChildApprovalsTabProps {
  items: PendingSupervisionRequest[];
  isLoading: boolean;
  actionLoading: boolean;
  notice: { type: "success" | "error"; message: string } | null;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  guardianRequestsQuery: UseQueryResult<GuardianRelationshipRequest[]>;
  isGuardianProcessing: boolean;
  onDeclineByCode: (code: string) => void;
  onOpenApproveModal: (targetName: string, code: string) => void;
  onOpenDeclineModal: (targetName: string) => void;
}

function formatActionType(actionType: string): string {
  return actionType
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(REGEX_PATTERNS.CAPITALIZE_WORDS, (c) => c.toUpperCase());
}

function resolveDisplayName(item: PendingSupervisionRequest): string {
  const minor = item.child || item.minorCard || item.minor || {};
  if (item.isApprovalItem) {
    return (
      item.requester?.displayName ||
      item.minorCard?.displayName ||
      item.minor?.displayName ||
      "Connection Request"
    );
  }
  return minor?.displayName || item.displayName || item.name || "Minor Athlete";
}

function resolveRawAvatar(item: PendingSupervisionRequest): string | null | undefined {
  const minor = item.child || item.minorCard || item.minor || {};
  if (item.isApprovalItem) {
    return (
      item.requester?.avatarUrl ||
      item.minorCard?.avatarUrl ||
      item.minor?.avatarUrl
    );
  }
  return minor.avatarUrl || item.avatarUrl;
}

/**
 * Profile > Child Approval Requests tab.
 *
 * Displays pending approval requests from all supervised children
 * in the same card grid as the Supervision > Requested tab.
 */
export function ProfileChildApprovalsTab({
  items,
  isLoading,
  actionLoading,
  notice,
  onApprove,
  onDecline,
  guardianRequestsQuery,
  isGuardianProcessing,
  onDeclineByCode,
  onOpenApproveModal,
  onOpenDeclineModal,
}: Readonly<ProfileChildApprovalsTabProps>) {
  return (
    <div className="mhn-supervision-requests-stack">
      {notice && (
        <div
          className={`mhn-notice-banner ${notice.type === "success" ? "mhn-notice-success" : "mhn-notice-error"}`}
        >
          {notice.message}
        </div>
      )}

      {isLoading || guardianRequestsQuery.isLoading ? (
        <GuardianRequestSkeleton />
      ) : items.length === 0 &&
        (guardianRequestsQuery.data ?? []).length === 0 ? (
        <NoDataFound
          title="No Pending Approval Requests"
          description="No pending requests submitted by your children."
        />
      ) : (
        <div className="mhn-supervision-requests-grid">
          {items.map((item) => {
            const displayName = resolveDisplayName(item);
            const rawAvatar = resolveRawAvatar(item);
            const avatarUrl = resolveMediaUrl(
              rawAvatar,
              "/userPlaceholder.webp",
            );
            const badgeText =
              item.isApprovalItem && item.action
                ? `${formatActionType(item.action as string)} approval`
                : undefined;

            const subjectTitle =
              item.isApprovalItem && item.subject
                ? `${item.subject.kind || "Post"} ${item.subject.audience ? `(${item.subject.audience})` : ""}`.trim()
                : undefined;
            const subjectBody = item.isApprovalItem
              ? item.subject?.body
              : undefined;

            return (
              <SupervisionRequestRow
                key={item.id}
                avatarUrl={avatarUrl}
                displayName={displayName}
                roleTag="Player"
                badgeText={badgeText}
                subjectTitle={subjectTitle}
                subjectBody={subjectBody}
                declineLabel="Decline"
                approveLabel="Approve"
                disabled={actionLoading}
                onApprove={() => onApprove(item.id)}
                onDecline={() => onDecline(item.id)}
              />
            );
          })}
          {(guardianRequestsQuery.data ?? []).map((request) => {
            const isDemo = request.id.startsWith("demo-");
            return (
              <GuardianRelationshipRequestCard
                key={request.id}
                request={request}
                disabled={isGuardianProcessing}
                approveLabel="Accept"
                declineLabel="Ignore"
                onDecline={(selectedRequest) => {
                  if (isDemo) {
                    showInfoToast(
                      "This is demo data — connect the API to decline real requests.",
                    );
                    return;
                  }
                  const code = getGuardianRequestCode(selectedRequest);
                  if (code) {
                    onDeclineByCode(code);
                    return;
                  }
                  onOpenDeclineModal(getGuardianRequestName(selectedRequest));
                }}
                onApprove={(selectedRequest) => {
                  if (isDemo) {
                    showInfoToast(
                      "This is demo data — connect the API to approve real requests.",
                    );
                    return;
                  }
                  onOpenApproveModal(
                    getGuardianRequestName(selectedRequest),
                    getGuardianRequestCode(selectedRequest) || "",
                  );
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ChildApprovalsRefetchButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button type="button" className="ml-2 underline" onClick={onClick}>
      Refresh
    </Button>
  );
}
