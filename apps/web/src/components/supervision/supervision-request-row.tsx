import { Button } from '@/components/common/Button';
import { FallbackImage } from '@/components/ui/fallback-image';

export interface SupervisionRequestRowProps {
  avatarUrl: string;
  displayName: string;
  /** Role • team • location, already combined — kept as one prop since the
   * two callers (guardian relationship requests, content-approval items)
   * build it differently. */
  subtitle?: string;
  badgeText?: string;
  subjectTitle?: string;
  subjectBody?: string;
  declineLabel?: string;
  approveLabel?: string;
  disabled?: boolean;
  onApprove: () => void;
  onDecline: () => void;
}

/**
 * One compact row for a pending Supervision/Guardian request — avatar,
 * name, and a combined role/team/location subtitle on the left, Decline/
 * Approve on the right. Reuses `WhoToFollowWidget`'s own row shape
 * (`.mhn-who-to-follow-row`/`-avatar`/`-name`) instead of a new one, per
 * feedback 2026-08-30: "make request similar to card we have follow user
 * card similar". The one shared component both `GuardianRelationshipRequestCard`
 * (Supervision's guardian-relationship list, also reused on Profile's own
 * Guardian Requests tab) and `SupervisionRequestsTab`'s content-approval
 * list render through, instead of two near-duplicate card layouts.
 */
export function SupervisionRequestRow({
  avatarUrl,
  displayName,
  subtitle,
  badgeText,
  subjectTitle,
  subjectBody,
  declineLabel = 'Decline',
  approveLabel = 'Approve',
  disabled = false,
  onApprove,
  onDecline,
}: Readonly<SupervisionRequestRowProps>) {
  return (
    <div className="mhn-supervision-request-row">
      <div className="mhn-who-to-follow-row justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="mhn-who-to-follow-avatar">
            <FallbackImage src={avatarUrl} alt={displayName} fill sizes="36px" className="mhn-avatar-img object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <span title={displayName} className="mhn-who-to-follow-name block">
              {displayName}
            </span>
            {subtitle && <span className="mhn-req-subtitle">{subtitle}</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" className="mhn-req-btn-outline-sm" disabled={disabled} onClick={onDecline}>
            {declineLabel}
          </Button>
          <Button type="button" className="mhn-req-btn-solid-sm" disabled={disabled} onClick={onApprove}>
            {approveLabel}
          </Button>
        </div>
      </div>

      {badgeText && <div className="mhn-req-action-badge mt-2">{badgeText}</div>}

      {subjectBody && (
        <div className="mhn-req-subject-preview-box mt-2 mb-0">
          {subjectTitle && <div className="mhn-req-subject-title">{subjectTitle}</div>}
          <p className="mhn-req-subject-body">&quot;{subjectBody}&quot;</p>
        </div>
      )}
    </div>
  );
}
