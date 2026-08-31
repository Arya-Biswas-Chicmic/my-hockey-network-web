export enum SupervisionControlKeyEnum {
  // Feed Controls
  VIEW_FEED = 'VIEW_FEED',
  CREATE_POST = 'CREATE_POST',
  COMMENT_ON_POSTS = 'COMMENT_ON_POSTS',
  REACT_TO_POSTS = 'REACT_TO_POSTS',
  SHARE_POSTS = 'SHARE_POSTS',

  // Network Controls
  FOLLOW_OTHERS = 'FOLLOW_OTHERS',
  WHO_CAN_FOLLOW = 'WHO_CAN_FOLLOW',
  WHO_CAN_SEND_CONNECTION_REQUESTS = 'WHO_CAN_SEND_CONNECTION_REQUESTS',
  ACCEPT_CONNECTIONS = 'ACCEPT_CONNECTIONS',

  // Messaging Controls
  SEND_MESSAGES = 'SEND_MESSAGES',
  RECEIVE_MESSAGES = 'RECEIVE_MESSAGES',
  CREATE_GROUP_CHATS = 'CREATE_GROUP_CHATS',
  WHO_CAN_MESSAGE_THEM = 'WHO_CAN_MESSAGE_THEM',

  // Approval / Notification Controls
  REQUIRE_APPROVAL_ADULT_CONTACT = 'REQUIRE_APPROVAL_ADULT_CONTACT',
  REQUIRE_APPROVAL_CONNECTIONS = 'REQUIRE_APPROVAL_CONNECTIONS',
  REQUIRE_APPROVAL_TEAM_INVITES = 'REQUIRE_APPROVAL_TEAM_INVITES',
  REQUIRE_APPROVAL_MEDIA = 'REQUIRE_APPROVAL_MEDIA',
}

export const PermissionControlKey = SupervisionControlKeyEnum;
export type PermissionControlKey = SupervisionControlKeyEnum;

/**
 * Audience values for the `AUDIENCE`-kind supervision controls
 * (`WHO_CAN_FOLLOW`, `WHO_CAN_SEND_CONNECTION_REQUESTS`, `WHO_CAN_MESSAGE_THEM`,
 * `PROFILE_VISIBILITY`), matching the `allowedValues` the backend returns.
 *
 * The Supervision dropdowns previously listed display strings ("Everyone",
 * "Connections Only", "Nobody") as their option *values*, so the selected value
 * never matched what `GET /supervision/me/permissions` stores and the control
 * rendered as unselected — and picking an option sent that display string
 * straight to the API.
 */
export enum VisibilityAudienceEnum {
  PUBLIC = 'PUBLIC',
  HOCKEY_NETWORK = 'HOCKEY_NETWORK',
  CONNECTIONS = 'CONNECTIONS',
  HIDDEN = 'HIDDEN',
}

export type VisibilityAudience = `${VisibilityAudienceEnum}`;

/** Human-readable label for each audience value. */
export const VISIBILITY_AUDIENCE_LABELS: Record<VisibilityAudienceEnum, string> = {
  [VisibilityAudienceEnum.PUBLIC]: 'Everyone',
  [VisibilityAudienceEnum.HOCKEY_NETWORK]: 'Hockey Network',
  [VisibilityAudienceEnum.CONNECTIONS]: 'Connections Only',
  [VisibilityAudienceEnum.HIDDEN]: 'Nobody',
};

/**
 * Options for the follow/connection-request/messaging controls. `PUBLIC` is
 * intentionally absent: the backend's `allowedValues` for those three lists only
 * `HOCKEY_NETWORK`, `CONNECTIONS`, and `HIDDEN` — it is offered for
 * `PROFILE_VISIBILITY` alone.
 */
export const AUDIENCE_CONTACT_OPTIONS: VisibilityAudienceEnum[] = [
  VisibilityAudienceEnum.HOCKEY_NETWORK,
  VisibilityAudienceEnum.CONNECTIONS,
  VisibilityAudienceEnum.HIDDEN,
];

/** Options for `PROFILE_VISIBILITY`, which additionally allows `PUBLIC`. */
export const PROFILE_VISIBILITY_OPTIONS: VisibilityAudienceEnum[] = [
  VisibilityAudienceEnum.PUBLIC,
  VisibilityAudienceEnum.HOCKEY_NETWORK,
  VisibilityAudienceEnum.CONNECTIONS,
  VisibilityAudienceEnum.HIDDEN,
];
