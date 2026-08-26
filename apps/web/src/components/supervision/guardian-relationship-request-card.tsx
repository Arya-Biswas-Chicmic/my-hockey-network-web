import { MapPin } from 'lucide-react';
import type { GuardianRelationshipRequest } from '@my-hockey-network/core';

import { Button } from '@/components/common/Button';
import { FallbackImage } from '@/components/ui/fallback-image';
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
  const avatarUrl = resolveMediaUrl(counterparty.avatarUrl ?? request.avatarUrl, '/userPlaceholder.png');
  const roleTag = counterparty.roleTag ?? counterparty.primaryRole ?? request.roleTag ?? 'PLAYER';
  const teamName = counterparty.teamName;
  const teamLogo = resolveMediaUrl(counterparty.teamLogo, '/HC.png');
  const location = counterparty.location ?? counterparty.city;

  return (
    <article className="mhn-supervision-req-card mhn-req-card-centered">
      <div className="mhn-req-avatar-container">
        <FallbackImage src={avatarUrl} alt={displayName} width={72} height={72} className="mhn-req-avatar-lg" />
      </div>
      <h4 title={displayName} className="mhn-req-name-lg">{displayName}</h4>
      <p className="mhn-req-role-lg">{roleTag}</p>

      {teamName && (
        <div className="mhn-req-team-pill">
          <FallbackImage
            src={teamLogo}
            alt=""
            width={16}
            height={16}
            hideOnError
            className="mhn-req-team-logo-mini"
          />
          <span className="mhn-ellipsis-text">{teamName}</span>
        </div>
      )}

      {location && (
        <div className="mhn-req-loc-row">
          <MapPin size={12} className="mhn-flex-shrink-0" aria-hidden="true" />
          <span className="mhn-ellipsis-text">{location}</span>
        </div>
      )}

      <div className="mhn-req-btn-row">
        <Button type="button" className="mhn-req-btn-outline" disabled={disabled} onClick={() => onDecline(request)}>
          {declineLabel}
        </Button>
        <Button type="button" className="mhn-req-btn-solid" disabled={disabled} onClick={() => onApprove(request)}>
          {approveLabel}
        </Button>
      </div>
    </article>
  );
}
