export enum PostAudienceEnum {
  PUBLIC = 'PUBLIC',
  HOCKEY_NETWORK = 'HOCKEY_NETWORK',
  CONNECTIONS = 'CONNECTIONS',
  GROUP = 'GROUP',
  PRIVATE = 'PRIVATE',
}

export type PostAudience = `${PostAudienceEnum}`;

export enum ReactionTypeEnum {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  SUPPORT = 'SUPPORT',
}

export const REACTION_TYPE = ReactionTypeEnum;

export enum ReactionResultEnum {
  SUCCESS = 'SUCCESS',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  GUARDIAN_DISABLED = 'GUARDIAN_DISABLED',
  ERROR = 'ERROR',
}

export const REACTION_RESULT = ReactionResultEnum;

export enum RepostResultEnum {
  SUCCESS = 'SUCCESS',
  UNDONE = 'UNDONE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ERROR = 'ERROR',
}

export const REPOST_RESULT = RepostResultEnum;
