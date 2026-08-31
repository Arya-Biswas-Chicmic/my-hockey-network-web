"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import type { GuardianRelationshipRequest } from "@my-hockey-network/core";

import { Button } from "@/components/common/Button";
import { NoDataFound } from "@/components/common/no-data-found";
import { GuardianRequestSkeleton } from "@/components/supervision/guardian-request-skeleton";
import {
  getGuardianRequestCode,
  getGuardianRequestName,
  GuardianRelationshipRequestCard,
} from "@/components/supervision/guardian-relationship-request-card";
import { SupervisionRequestRow } from "@/components/supervision/supervision-request-row";
import { resolveMediaUrl } from "@/utils/mediaUtils";
import { showInfoToast } from "@/utils/toast";
import { DEMO_GUARDIAN_REQUESTS } from "@/demo-data/supervision";
import type { PendingSupervisionRequest } from "@/hooks/use-supervision-requests";

export interface SupervisionRequestsTabProps {
  requestNotice: { type: "success" | "error"; message: string } | null;
  guardianRequestsQuery: UseQueryResult<GuardianRelationshipRequest[]>;
  livePendingRequests: PendingSupervisionRequest[];
  isRequestsLoading: boolean;
  requestActionLoading: boolean;
  onApproveApprovalItem: (approvalId: string) => void;
  onDeclineApprovalItem: (approvalId: string) => void;
  /** Fire-and-forget decline for a plain guardian-code item (no modal). */
  onDeclineByCode: (code: string) => void;
  /**
   * Opens the approval modal. The first (`livePendingRequests`) list
   * always opens with an empty code — matching original behavior exactly,
   * even though a `code` was already known in scope there — while the
   * `GuardianRelationshipRequestCard` list below pre-fills it. Preserved
   * as-is rather than "fixed" during this decomposition pass.
   */
  onOpenApproveModal: (targetName: string, code: string) => void;
  /** Opens the decline modal for a card-list item with no known code. */
  onOpenDeclineModal: (targetName: string) => void;
}

/**
 * Supervision > Requests tab: general approval items (posts/comments/
 * reactions pending guardian approval) plus guardian-relationship
 * requests. Extracted from `screens/supervision-page.tsx`.
 */
export function SupervisionRequestsTab({
  requestNotice,
  guardianRequestsQuery,
  livePendingRequests,
  isRequestsLoading,
  requestActionLoading,
  onApproveApprovalItem,
  onDeclineApprovalItem,
  onDeclineByCode,
  onOpenApproveModal,
  onOpenDeclineModal,
}: Readonly<SupervisionRequestsTabProps>) {
  // Demo requests are appended after real ones, never replacing them (same
  // "real first, demo after" convention as `useHomeFeed`'s demo posts —
  // see docs/DEMO_DATA_POLICY.md) — feedback 2026-08-30: "multiple request
  // from demo data". Non-empty, so the empty state below only shows if
  // this dataset itself is ever cleared.
  const guardianRequests = [
    ...(guardianRequestsQuery.data ?? []),
    ...DEMO_GUARDIAN_REQUESTS,
  ];
  const hasNoRequests =
    livePendingRequests.length === 0 && guardianRequests.length === 0;

  return (
    <div className="mhn-supervision-requests-stack">
      {requestNotice && (
        <div
          className={`mhn-notice-banner ${requestNotice.type === "success" ? "mhn-notice-success" : "mhn-notice-error"}`}
        >
          {requestNotice.message}
        </div>
      )}
      {guardianRequestsQuery.error && (
        <div className="mhn-notice-banner mhn-notice-error">
          <span>Guardian requests could not be loaded.</span>
          <Button
            type="button"
            className="ml-2 underline"
            onClick={() => void guardianRequestsQuery.refetch()}
          >
            Try Again
          </Button>
        </div>
      )}

      <div>
        {isRequestsLoading || guardianRequestsQuery.isLoading ? (
          <GuardianRequestSkeleton />
        ) : hasNoRequests ? (
          <NoDataFound
            title="No Pending Approval Requests"
            description="There are currently no pending child requests or content approvals."
          />
        ) : (
          <div className="mhn-supervision-requests-grid">
            {livePendingRequests.map((req, idx) => {
              const reqId = req.id || `req_${idx}`;
              const isApprovalItem = Boolean(req.isApprovalItem);

              const child = req.child || req.minorCard || req.minor || {};

              const displayName = isApprovalItem
                ? req.requester?.displayName ||
                  req.minorCard?.displayName ||
                  req.minor?.displayName ||
                  "Connection Request"
                : child.displayName ||
                  req.displayName ||
                  req.name ||
                  "Minor Athlete";

              const rawAvatar = isApprovalItem
                ? req.requester?.avatarUrl ||
                  req.minorCard?.avatarUrl ||
                  req.minor?.avatarUrl
                : child.avatarUrl || req.avatarUrl;

              const avatarUrl = resolveMediaUrl(
                rawAvatar,
                "/userPlaceholder.webp",
              );

              const roleTag = isApprovalItem
                ? req.requester?.roleTag ||
                  req.minorCard?.roleTag ||
                  (req.requester?.primaryRole
                    ? String(req.requester.primaryRole)
                    : "Parent")
                : child.roleTag ||
                  (child.position
                    ? `${child.position}${child.jerseyNumber ? ` • #${child.jerseyNumber}` : ""}`
                    : child.primaryRole || child.profileType || "PLAYER");

              const teamName = isApprovalItem
                ? req.requester?.teamName || req.minorCard?.teamName
                : child.teamName || req.teamName;

              const location = isApprovalItem
                ? req.requester?.location ||
                  req.minorCard?.location ||
                  req.minor?.city
                : child.location || req.location || child.city;

              const code = req.code || req.devCode || req.inviteCode;

              return (
                <SupervisionRequestRow
                  key={reqId}
                  avatarUrl={avatarUrl}
                  displayName={displayName}
                  roleTag={roleTag}
                  teamName={teamName ?? ""}
                  location={location ?? ""}
                  badgeText={
                    isApprovalItem && req.action
                      ? `${String(req.action).replace(/_/g, " ")} approval`
                      : undefined
                  }
                  subjectTitle={
                    isApprovalItem && req.subject
                      ? `${req.subject.kind || "Post"} ${req.subject.audience ? `(${req.subject.audience})` : ""}`.trim()
                      : undefined
                  }
                  subjectBody={isApprovalItem ? req.subject?.body : undefined}
                  declineLabel="Ignore"
                  approveLabel="Accept"
                  disabled={requestActionLoading}
                  onDecline={() => {
                    if (isApprovalItem) {
                      onDeclineApprovalItem(reqId);
                    } else {
                      // Fire-and-forget, matching the original — no modal for this list's decline.
                      onDeclineByCode(code || reqId);
                    }
                  }}
                  onApprove={() => {
                    if (isApprovalItem) {
                      onApproveApprovalItem(reqId);
                    } else {
                      // Empty code is deliberate here — matches original behavior exactly.
                      onOpenApproveModal(displayName, "");
                    }
                  }}
                />
              );
            })}
            {guardianRequests.map((request) => {
              const isDemo = request.id.startsWith("demo-");
              return (
                <GuardianRelationshipRequestCard
                  key={request.id}
                  request={request}
                  disabled={requestActionLoading}
                  approveLabel="Accept"
                  declineLabel="Ignore"
                  onDecline={(selectedRequest) => {
                    // Demo items have no real backend record to decline —
                    // route to a toast instead of the live API/modal flow,
                    // same "honest, clearly labeled placeholder" pattern
                    // used for messaging attachments elsewhere.
                    if (isDemo) {
                      showInfoToast(
                        "This is demo data — connect the guardian-relationship API to decline real requests.",
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
                        "This is demo data — connect the guardian-relationship API to approve real requests.",
                      );
                      return;
                    }
                    onOpenApproveModal(
                      getGuardianRequestName(selectedRequest),
                      getGuardianRequestCode(selectedRequest),
                    );
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
