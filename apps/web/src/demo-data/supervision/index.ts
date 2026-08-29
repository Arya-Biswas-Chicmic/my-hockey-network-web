import type { GuardianRelationshipRequest } from '@my-hockey-network/core';
import type { ActivityLogView } from '@/hooks/use-supervision-logs';

/**
 * Supervision demo data — feedback 2026-08-30: "make request similar to
 * card we have follow user card similar and multiple request from demo
 * data and in log tabs and add 10 logs like accepted request, like the
 * video etc". Always appended AFTER real API results (never replacing
 * them), same convention as `useHomeFeed`'s demo posts — see
 * `docs/DEMO_DATA_POLICY.md`. IDs are prefixed `demo-` so callers can
 * route their actions to a demo-safe (toast-only) path instead of hitting
 * the real approve/decline/API endpoints with a fabricated id.
 */
export const DEMO_GUARDIAN_REQUESTS: GuardianRelationshipRequest[] = [
  {
    id: 'demo-guardian-req-1',
    devCode: '482913',
    counterparty: {
      id: 'demo-profile-jack',
      type: 'PROFILE',
      displayName: 'Jack Hughes',
      roleTag: 'C • #86',
      teamName: 'HC Bloemendaal',
      location: 'Austria, Europe',
    },
  },
  {
    id: 'demo-guardian-req-2',
    devCode: '719044',
    counterparty: {
      id: 'demo-profile-lucas',
      type: 'PROFILE',
      displayName: 'Lucas Bennett',
      roleTag: 'Head Coach • U16 AAA',
      teamName: 'HC Bloemendaal',
      location: 'Austria, Europe',
    },
  },
  {
    id: 'demo-guardian-req-3',
    devCode: '305587',
    counterparty: {
      id: 'demo-profile-connor',
      type: 'PROFILE',
      displayName: 'Connor McDavid',
      roleTag: 'C • #97',
      teamName: 'HC Bloemendaal',
      location: 'Austria, Europe',
    },
  },
];

export const DEMO_SUPERVISION_LOGS: ActivityLogView[] = [
  { id: 'demo-log-1', dateTime: 'Aug 29, 2026, 06:15 PM', activity: 'Accepted a connection request from Sidney Crosby', initiatedBy: 'Parent', actionText: 'View' },
  { id: 'demo-log-2', dateTime: 'Aug 29, 2026, 04:02 PM', activity: 'Watched a video in Team Practice Highlights', initiatedBy: 'Steve', actionText: 'View' },
  { id: 'demo-log-3', dateTime: 'Aug 28, 2026, 09:40 PM', activity: 'Liked a post from Nathan MacKinnon', initiatedBy: 'Steve', actionText: 'View' },
  { id: 'demo-log-4', dateTime: 'Aug 28, 2026, 03:11 PM', activity: 'Commented on a post in KC Blueknocks', initiatedBy: 'David', actionText: 'View' },
  { id: 'demo-log-5', dateTime: 'Aug 27, 2026, 11:26 AM', activity: 'Declined a connection request from an unlisted account', initiatedBy: 'Parent', actionText: 'View' },
  { id: 'demo-log-6', dateTime: 'Aug 26, 2026, 07:54 PM', activity: 'Shared a post to their feed', initiatedBy: 'David', actionText: 'View' },
  { id: 'demo-log-7', dateTime: 'Aug 26, 2026, 02:18 PM', activity: 'Sent a message to Coach Jack Ruffle', initiatedBy: 'Steve', actionText: 'View' },
  { id: 'demo-log-8', dateTime: 'Aug 25, 2026, 05:47 PM', activity: 'Followed Auston Matthews', initiatedBy: 'Steve', actionText: 'View' },
  { id: 'demo-log-9', dateTime: 'Aug 25, 2026, 10:03 AM', activity: 'Updated notification preferences', initiatedBy: 'Parent', actionText: 'View' },
  { id: 'demo-log-10', dateTime: 'Aug 24, 2026, 08:29 PM', activity: 'Joined the group Winter Classic Training Camp', initiatedBy: 'David', actionText: 'View' },
];
