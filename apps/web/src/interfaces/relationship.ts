import type { RelationshipStatus } from '@/enums/status';

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

export interface GuardianChildProfile {
  userId: string;
  profileId?: string;
  displayName: string;
  avatarUrl?: string | null;
  age?: number;
  isMinor?: boolean;
  accessLevel?: string;
  profileType?: string;
  primaryRole?: string;
  roles?: string[];
  position?: string | null;
  jerseyNumber?: number | string | null;
  roleTag?: string | null;
  teamName?: string | null;
  teamLogo?: string | null;
  ageGroup?: string | null;
  location?: string | null;
}

export interface GuardianRequestItem {
  id: string;
  expired: boolean;
  expiresAt: string;
  createdAt: string;
  attemptsRemaining?: number;
  childSetupComplete?: boolean;
  code?: string;
  status?: RelationshipStatus;
  child?: GuardianChildProfile;
}

export interface PendingGuardianRequestsResponse {
  items: GuardianRequestItem[];
}
