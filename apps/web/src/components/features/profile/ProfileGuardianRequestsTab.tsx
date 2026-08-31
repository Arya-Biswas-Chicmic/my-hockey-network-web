"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import type { GuardianRelationshipRequest } from "@my-hockey-network/core";

import { NoDataFound } from "@/components/common/no-data-found";
import { GuardianRequestSkeleton } from "@/components/supervision/guardian-request-skeleton";
import {
  getGuardianRequestCode,
  getGuardianRequestName,
  GuardianRelationshipRequestCard,
} from "@/components/supervision/guardian-relationship-request-card";

export interface ProfileGuardianRequestsTabProps {
  query: UseQueryResult<GuardianRelationshipRequest[]>;
  disabled: boolean;
  onApprove: (request: GuardianRelationshipRequest) => void;
  onDecline: (request: GuardianRelationshipRequest) => void;
}

/**
 * Profile > Guardian Requests tab (child-facing invites: a parent adds a
 * child, then the child approves here). Extracted from
 * `screens/profile-page.tsx`.
 */
export function ProfileGuardianRequestsTab({
  query,
  disabled,
  onApprove,
  onDecline,
}: Readonly<ProfileGuardianRequestsTabProps>) {

  return (
    <div className="rounded-lg border border-auth-stroke bg-auth-field p-5 text-foreground">
      <div className="mhn-posts-header-bar mhn-mb-20">
        <h3 className="mhn-posts-title">Pending Guardian Invites</h3>
      </div>

      {query.isLoading ? (
        <GuardianRequestSkeleton />
      ) : query.error ? (
        <NoDataFound
          title="Unable to Load Guardian Invites"
          description="Please try again. Your pending invitations have not been changed."
          actionLabel="Try Again"
          onAction={() => void query.refetch()}
        />
      ) : (query.data ?? []).length === 0 ? (
        <NoDataFound
          title="No Pending Guardian Invites"
          description="There are currently no guardian invitations waiting for your approval."
        />
      ) : (
        <div className="mhn-supervision-requests-grid">
          {(query.data ?? []).map((request) => (
            <GuardianRelationshipRequestCard
              key={request.id}
              request={request}
              disabled={disabled}
              onDecline={onDecline}
              onApprove={onApprove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { getGuardianRequestCode, getGuardianRequestName };
