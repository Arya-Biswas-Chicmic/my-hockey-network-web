export enum EntityTypeEnum {
  USER = 'USER',
  PROFILE = 'PROFILE',
  GROUP = 'GROUP',
  ORGANIZATION = 'ORGANIZATION',
}

export enum RelationshipTypeEnum {
  FOLLOW = 'FOLLOW',
  CONNECTION = 'CONNECTION',
  GUARDIAN = 'GUARDIAN',
  SUPERVISION = 'SUPERVISION',
}

export enum RelationshipStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  BLOCKED = 'BLOCKED',
  REMOVED = 'REMOVED',
}

export enum RelationshipDirectionEnum {
  OUTGOING = 'outgoing',
  INCOMING = 'incoming',
}
