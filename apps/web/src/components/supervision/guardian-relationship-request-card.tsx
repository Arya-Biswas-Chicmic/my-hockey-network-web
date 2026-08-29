import type { GuardianRelationshipRequest } from '@my-hockey-network/core';

import { SupervisionRequestRow } from '@/components/supervision/supervision-request-row';
import { resolveMediaUrl } from '@/utils/mediaUtils';

interface GuardianRelationshipRequestCardProps {
  request: GuardianRelationshipRequest;
  disabled?: boolean;
  approveLabel?: string;
  declineLabel?: string;
  onApprove: (request: GuardianRelationshipRequest) => void;
  onDecline: (request: GuardianRelationshipRequest) => void;
}

export function getGuardianRequestCode(request: GuardianRelationshipRequest): string {
  return request.code ?? request.devCode ?? request.inviteCode ?? '';
}

export function getGuardianRequestName(request: GuardianRelationshipRequest): string {
  const counterparty = request.counterparty ?? request.requester ?? request.child ?? request.minor;
  return counterparty?.displayName ?? request.displayName ?? request.name ?? 'Hockey member';
}

export function GuardianRelationshipRequestCard({
  request,
  disabled = false,
  approveLabel = 'Approve',
  declineLabel = 'Decline',
  onApprove,
  onDecline,
}: Readonly<GuardianRelationshipRequestCardProps>) {
  const counterparty = request.counterparty ?? request.requester ?? request.child ?? request.minor ?? {};
  const displayName = getGuardianRequestName(request);
  const avatarUrl = resolveMediaUrl(counterparty.avatarUrl ?? request.avatarUrl, '/userPlaceholder.webp');
  const roleTag = counterparty.roleTag ?? counterparty.primaryRole ?? request.roleTag ?? 'PLAYER';
  const teamName = counterparty.teamName;
  const location = counterparty.location ?? counterparty.city;
  const subtitle = [roleTag, teamName, location].filter(Boolean).join(' • ');

  return (
    <SupervisionRequestRow
      avatarUrl={avatarUrl}
      displayName={displayName}
      subtitle={subtitle}
      declineLabel={declineLabel}
      approveLabel={approveLabel}
      disabled={disabled}
      onApprove={() => onApprove(request)}
      onDecline={() => onDecline(request)}
    />
  );
}
