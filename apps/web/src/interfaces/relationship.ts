import type { RelationshipStatus } from '../enums/status';

export interface NetworkUserItem {
  id: string;
  userId?: string;
  displayName: string;
  avatarUrl?: string | null;
  roleTag?: string;
  location?: string;
  teamName?: string;
  connectionStatus?: 'CONNECTED' | 'PENDING' | 'NOT_CONNECTED';
  mutualConnectionsCount?: number;
}

export interface NetworkGroupItem {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  membersCount: number;
  privacy: 'PUBLIC' | 'PRIVATE';
  isMember?: boolean;
}

export interface GuardianRequestItem {
  id: string;
  code?: string;
  status: RelationshipStatus;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
  child?: {
    userId: string;
    displayName: string;
    email?: string;
    roleTag?: string;
    teamName?: string;
    location?: string;
  };
}

export interface PendingGuardianRequestsResponse {
  items: GuardianRequestItem[];
}
