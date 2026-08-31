import { Button } from '@/components/common/Button';
import { FallbackImage } from '@/components/ui/fallback-image';
import NextImage from 'next/image';

export interface SupervisionRequestRowProps {
  avatarUrl: string;
  displayName: string;
  roleTag?: string;
  teamName?: string;
  location?: string;
  badgeText?: string;
  subjectTitle?: string;
  subjectBody?: string;
  declineLabel?: string;
  approveLabel?: string;
  disabled?: boolean;
  onApprove: () => void;
  onDecline: () => void;
}

function getTeamLogo(teamName?: string): string | undefined {
  if (!teamName) return undefined;
  const normalized = teamName.toLowerCase();
  if (normalized.includes('bloemendaal') || normalized.includes('hc')) {
    return '/HC.webp';
  }
  if (normalized.includes('columbus') || normalized.includes('jackets') || normalized.includes('blue')) {
    return '/columbus.webp';
  }
  return undefined;
}

export function SupervisionRequestRow({
  avatarUrl,
  displayName,
  roleTag,
  teamName,
  location,
  badgeText,
  subjectTitle,
  subjectBody,
  declineLabel = 'Ignore',
  approveLabel = 'Accept',
  disabled = false,
  onApprove,
  onDecline,
}: Readonly<SupervisionRequestRowProps>) {
  const teamLogo = getTeamLogo(teamName);

  return (
    <div className="mhn-supervision-req-card">
      <div className="mhn-supervision-req-avatar-wrapper">
        <FallbackImage src={avatarUrl} alt={displayName} fill className="mhn-supervision-req-avatar" />
      </div>

      <h3 className="mhn-supervision-req-name">{displayName}</h3>
      {roleTag && <p className="mhn-supervision-req-role">{roleTag}</p>}

      {teamName && (
        <div className="mhn-supervision-req-team-pill">
          {teamLogo && (
            <NextImage src={teamLogo} alt="" width={16} height={16} className="mhn-supervision-req-team-logo" />
          )}
          <span>{teamName}</span>
        </div>
      )}

      {location && (
        <div className="mhn-supervision-req-location">
          <NextImage src="/location2.webp" alt="" width={12} height={12} />
          <span>{location}</span>
        </div>
      )}

      {badgeText && <div className="mhn-req-action-badge mt-2">{badgeText}</div>}

      {subjectBody && (
        <div className="mhn-req-subject-preview-box mt-2 mb-0">
          {subjectTitle && <div className="mhn-req-subject-title">{subjectTitle}</div>}
          <p className="mhn-req-subject-body">&quot;{subjectBody}&quot;</p>
        </div>
      )}

      <div className="mhn-supervision-req-actions">
        <Button type="button" className="mhn-supervision-btn-ignore" disabled={disabled} onClick={onDecline}>
          {declineLabel}
        </Button>
        <Button type="button" className="mhn-supervision-btn-accept" disabled={disabled} onClick={onApprove}>
          {approveLabel}
        </Button>
      </div>
    </div>
  );
}

