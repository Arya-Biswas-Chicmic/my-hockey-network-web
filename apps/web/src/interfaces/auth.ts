import type { UserRole } from '@/enums/role';

export interface UserProfileData {
  id: string;
  type?: string;
  displayName: string;
  avatarUrl: string | null;
  isMinor: boolean;
  accessLevel: 'LIMITED' | 'SUPERVISED' | 'INDEPENDENT' | 'PARENT_MANAGED';
  verificationStatus: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  dateOfBirth?: string;
}

export interface AuthSessionData {
  accessToken?: string;
  refreshToken?: string;
  csrfToken?: string;
  isNewUser: boolean;
  onboardingCompleted: boolean;
  expiresInSeconds: number;
}
