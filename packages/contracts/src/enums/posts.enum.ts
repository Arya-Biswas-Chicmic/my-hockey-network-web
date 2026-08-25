export enum PostAudienceEnum {
  PUBLIC = 'PUBLIC',
  HOCKEY_NETWORK = 'HOCKEY_NETWORK',
  CONNECTIONS = 'CONNECTIONS',
  GROUP = 'GROUP',
  PRIVATE = 'PRIVATE',
}

export type PostAudience = `${PostAudienceEnum}`;
