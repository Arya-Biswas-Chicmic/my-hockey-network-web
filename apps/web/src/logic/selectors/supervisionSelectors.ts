import { formatDisplayName, formatUserAvatar, formatRoleTag } from '../formatters/userFormatters';

export interface SupervisionRequestItem {
  id: string;
  isApprovalItem?: boolean;
  action?: string;
  requester?: any;
  minorCard?: any;
  minor?: any;
  child?: any;
  displayName?: string;
  name?: string;
  avatarUrl?: string;
  roleTag?: string;
  teamName?: string;
  teamLogo?: string;
  location?: string;
  city?: string;
  subject?: {
    kind?: string;
    audience?: string;
    body?: string;
  };
  code?: string;
  devCode?: string;
  inviteCode?: string;
}

export interface FormattedSupervisionCard {
  id: string;
  isApprovalItem: boolean;
  displayName: string;
  avatarUrl: string;
  roleTag: string;
  teamName: string | null;
  teamLogo: string;
  location: string;
  actionBadge: string | null;
  subjectPreview: {
    title: string;
    body: string | null;
  } | null;
  code: string | null;
  declineLabel: string;
  approveLabel: string;
}

export function selectActionBadgeLabel(action?: string): string | null {
  if (!action) return null;
  if (action === 'POST_MEDIA' || action === 'CREATE_POST') return 'Post Approval';
  if (action === 'COMMENT_ON_POSTS') return 'Comment Approval';
  if (action === 'REACT_TO_POSTS') return 'Reaction Approval';
  return String(action).replace(/_/g, ' ');
}

export function selectFormattedSupervisionCards(requests: SupervisionRequestItem[]): FormattedSupervisionCard[] {
  if (!requests || !Array.isArray(requests)) return [];

  return requests.map((req, idx) => {
    const reqId = req.id || `req_${idx}`;
    const isApprovalItem = Boolean(req.isApprovalItem);

    const child = req.child || req.minorCard || req.minor || {};
    const requester = req.requester || req.minorCard || req.minor || {};

    const rawName = isApprovalItem
      ? (req.requester?.displayName || req.minorCard?.displayName || req.minor?.displayName || 'Connection Request')
      : (child.displayName || req.displayName || req.name || 'Minor Athlete');

    const displayName = formatDisplayName(rawName);

    const rawAvatar = isApprovalItem
      ? (req.requester?.avatarUrl || req.minorCard?.avatarUrl || req.minor?.avatarUrl)
      : (child.avatarUrl || req.avatarUrl);

    const avatarUrl = formatUserAvatar(rawAvatar);

    const roleTag = isApprovalItem
      ? (req.requester?.roleTag || req.minorCard?.roleTag || (req.requester?.primaryRole ? String(req.requester.primaryRole) : 'Parent'))
      : (child.roleTag || (child.position ? `${child.position}${child.jerseyNumber ? ` • #${child.jerseyNumber}` : ''}` : child.primaryRole || child.profileType || 'PLAYER'));

    const teamName = isApprovalItem
      ? (req.requester?.teamName || req.minorCard?.teamName || null)
      : (child.teamName || req.teamName || null);

    const rawTeamLogo = isApprovalItem ? req.requester?.teamLogo : child.teamLogo;
    const teamLogo = formatUserAvatar(rawTeamLogo, '/HC.png');

    const location = isApprovalItem
      ? (req.requester?.location || req.minorCard?.location || req.minor?.city || 'Austria, Europe')
      : (child.location || req.location || child.city || 'Austria, Europe');

    const actionBadge = isApprovalItem ? selectActionBadgeLabel(req.action) : null;

    const subjectPreview = isApprovalItem && req.subject
      ? {
          title: `${req.subject.kind || 'Post'} ${req.subject.audience ? `(${req.subject.audience})` : ''}`.trim(),
          body: req.subject.body || null,
        }
      : null;

    const code = req.code || req.devCode || req.inviteCode || null;

    return {
      id: reqId,
      isApprovalItem,
      displayName,
      avatarUrl,
      roleTag,
      teamName,
      teamLogo,
      location,
      actionBadge,
      subjectPreview,
      code,
      declineLabel: isApprovalItem ? 'Ignore' : 'Decline',
      approveLabel: isApprovalItem ? 'Accept' : 'Approve',
    };
  });
}
