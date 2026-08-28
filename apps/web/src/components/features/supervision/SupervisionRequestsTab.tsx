'use client';

import { MapPin } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { GuardianRelationshipRequest } from '@my-hockey-network/core';

import { Button } from '@/components/common/Button';
import { NoDataFound } from '@/components/common/no-data-found';
import { FallbackImage } from '@/components/ui/fallback-image';
import { GuardianRequestSkeleton } from '@/components/supervision/guardian-request-skeleton';
import {
  getGuardianRequestCode,
  getGuardianRequestName,
  GuardianRelationshipRequestCard,
} from '@/components/supervision/guardian-relationship-request-card';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import type { PendingSupervisionRequest } from '@/hooks/use-supervision-requests';

export interface SupervisionRequestsTabProps {
  requestNotice: { type: 'success' | 'error'; message: string } | null;
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
  const hasNoRequests = livePendingRequests.length === 0 && (guardianRequestsQuery.data ?? []).length === 0;

  return (
    <div className="mhn-supervision-requests-stack">
      {requestNotice && (
        <div className={`mhn-notice-banner ${requestNotice.type === 'success' ? 'mhn-notice-success' : 'mhn-notice-error'}`}>
          {requestNotice.message}
        </div>
      )}
      {guardianRequestsQuery.error && (
        <div className="mhn-notice-banner mhn-notice-error">
          <span>Guardian requests could not be loaded.</span>
          <Button type="button" className="ml-2 underline" onClick={() => void guardianRequestsQuery.refetch()}>
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
                ? (req.requester?.displayName || req.minorCard?.displayName || req.minor?.displayName || 'Connection Request')
                : (child.displayName || req.displayName || req.name || 'Minor Athlete');

              const rawAvatar = isApprovalItem
                ? (req.requester?.avatarUrl || req.minorCard?.avatarUrl || req.minor?.avatarUrl)
                : (child.avatarUrl || req.avatarUrl);

              const avatarUrl = resolveMediaUrl(rawAvatar, '/userPlaceholder.webp');

              const roleTag = isApprovalItem
                ? (req.requester?.roleTag || req.minorCard?.roleTag || (req.requester?.primaryRole ? String(req.requester.primaryRole) : 'Parent'))
                : (child.roleTag || (child.position ? `${child.position}${child.jerseyNumber ? ` • #${child.jerseyNumber}` : ''}` : child.primaryRole || child.profileType || 'PLAYER'));

              const teamName = isApprovalItem
                ? (req.requester?.teamName || req.minorCard?.teamName)
                : (child.teamName || req.teamName);

              const rawTeamLogo = isApprovalItem ? req.requester?.teamLogo : child.teamLogo;
              const teamLogo = rawTeamLogo ? resolveMediaUrl(rawTeamLogo, '/HC.webp') : '/HC.webp';

              const location = isApprovalItem
                ? (req.requester?.location || req.minorCard?.location || req.minor?.city)
                : (child.location || req.location || child.city);

              const code = req.code || req.devCode || req.inviteCode;

              return (
                <div key={reqId} className="mhn-supervision-req-card mhn-req-card-centered">
                  <div className="mhn-req-avatar-container">
                    <FallbackImage src={avatarUrl} alt={displayName} width={72} height={72} className="mhn-req-avatar-lg" />
                  </div>

                  <h4 title={displayName} className="mhn-req-name-lg">{displayName}</h4>
                  <p className="mhn-req-role-lg">{roleTag}</p>

                  {teamName && (
                    <div className="mhn-req-team-pill">
                      <FallbackImage src={teamLogo} alt="Team" width={16} height={16} hideOnError className="mhn-req-team-logo-mini" />
                      <span className="mhn-ellipsis-text">{teamName}</span>
                    </div>
                  )}

                  {location && (
                    <div className="mhn-req-loc-row">
                      <MapPin size={12} className="mhn-flex-shrink-0" aria-hidden="true" />
                      <span className="mhn-ellipsis-text">{location}</span>
                    </div>
                  )}

                  {isApprovalItem && req.action && (
                    <div className="mhn-req-action-badge">
                      {`${String(req.action).replace(/_/g, ' ')} approval`}
                    </div>
                  )}

                  {isApprovalItem && req.subject && (
                    <div className="mhn-req-subject-preview-box">
                      <div className="mhn-req-subject-title">
                        {req.subject.kind || 'Post'} {req.subject.audience ? `(${req.subject.audience})` : ''}
                      </div>
                      {req.subject.body && <p className="mhn-req-subject-body">&quot;{req.subject.body}&quot;</p>}
                    </div>
                  )}

                  <div className="mhn-req-btn-row">
                    <Button
                      type="button"
                      className="mhn-req-btn-outline"
                      disabled={requestActionLoading}
                      onClick={() => {
                        if (isApprovalItem) {
                          onDeclineApprovalItem(reqId);
                        } else {
                          // Fire-and-forget, matching the original — no modal for this list's decline.
                          onDeclineByCode(code || reqId);
                        }
                      }}
                    >
                      {isApprovalItem ? 'Ignore' : 'Decline'}
                    </Button>
                    <Button
                      type="button"
                      className="mhn-req-btn-solid"
                      disabled={requestActionLoading}
                      onClick={() => {
                        if (isApprovalItem) {
                          onApproveApprovalItem(reqId);
                        } else {
                          // Empty code is deliberate here — matches original behavior exactly.
                          onOpenApproveModal(displayName, '');
                        }
                      }}
                    >
                      {isApprovalItem ? 'Accept' : 'Approve'}
                    </Button>
                  </div>
                </div>
              );
            })}
            {(guardianRequestsQuery.data ?? []).map((request) => (
              <GuardianRelationshipRequestCard
                key={request.id}
                request={request}
                disabled={requestActionLoading}
                onDecline={(selectedRequest) => {
                  const code = getGuardianRequestCode(selectedRequest);
                  if (code) {
                    onDeclineByCode(code);
                    return;
                  }
                  onOpenDeclineModal(getGuardianRequestName(selectedRequest));
                }}
                onApprove={(selectedRequest) => {
                  onOpenApproveModal(getGuardianRequestName(selectedRequest), getGuardianRequestCode(selectedRequest));
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
