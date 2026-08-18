/**
 * Shared API Type Definitions for Web & Mobile matching mhn-backend specification
 */

export type ChannelType = 'EMAIL' | 'SMS';
export type AuthIntent = 'SIGNUP' | 'SIGNIN';
export type UserRole = 'PLAYER' | 'PARENT' | 'COACH' | 'STAFF';

export interface OtpRequestDTO {
  channel: ChannelType;
  destination: string;
  intent: AuthIntent;
}

export interface OtpRequestResponse {
  expiresInSeconds?: number;
  expiresAt?: string;
  devCode?: string; // Dev code returned when OTP_DEV_EXPOSE is on
  code?: string;
}

export interface OtpVerifyDTO {
  channel: ChannelType;
  destination: string;
  code: string;
  intent: AuthIntent;
}

export interface OtpVerifyResponse {
  isNewUser: boolean;
  onboardingCompleted: boolean;
  tokenDelivery: 'web' | 'mobile';
  csrfToken?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresInSeconds: number;
}

export interface OnboardingDTO {
  roles: UserRole[];
  displayName: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // YYYY-MM-DD format
  city?: string;
  preferredLanguage?: string;
}

export interface OnboardingResponse {
  profileId: string;
  roles: UserRole[];
  primaryRole: string;
  isMinor: boolean;
}

export interface AuthMeResponse {
  id: string;
  phone: string | null;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  primaryRole: string;
  roleAssignments: Array<{
    role: string;
    scopeType: string | null;
    scopeId: string | null;
  }>;
  onboardingCompletedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  profile?: {
    id: string;
    type: string;
    displayName: string;
    avatarUrl: string | null;
    isMinor: boolean;
    accessLevel: 'LIMITED' | 'SUPERVISED' | 'FULL';
    verificationStatus: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    city?: string;
    dateOfBirth?: string;
    position?: string;
    shootsCatches?: string;
    jerseyNumber?: number | string | null;
    genderCategory?: string;
    preferredLanguage?: string;
    defaultVisibility?: string;
  };
  counts?: {
    followers?: number;
    following?: number;
  };
}

export interface GuardianRequestDTO {
  parentEmail: string;
}

export interface GuardianRequestResponse {
  id: string;
  status: string;
  message?: string;
}
