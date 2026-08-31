import type { AuthIntentEnum, ChannelTypeEnum, UserRoleEnum, UserStatusEnum } from '../enums';
import type { CareerEntry } from './profile.types';

export interface HeightValue {
  cm?: number;
  feet?: number;
  inches?: number;
  formatted?: string;
}

export interface WeightValue {
  kg?: number;
  lb?: number;
  formatted?: string;
}

export type ChannelType = ChannelTypeEnum | 'EMAIL' | 'SMS';
export type AuthIntent = AuthIntentEnum | 'SIGNUP' | 'SIGNIN';
export type UserRole = UserRoleEnum | 'PLAYER' | 'PARENT' | 'COACH' | 'STAFF';

export interface OtpRequestDTO {
  channel: ChannelType;
  destination: string;
  intent: AuthIntent;
}

export interface OtpRequestResponse {
  expiresInSeconds?: number;
  expiresAt?: string;
  devCode?: string;
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
  dateOfBirth?: string;
  city?: string;
  preferredLanguage?: string;
  parentEmail?: string;
  requiresParentApproval?: boolean;
}

export interface OnboardingResponse {
  profileId: string;
  roles: UserRole[];
  primaryRole: string;
  isMinor: boolean;
  requiresParentApproval?: boolean;
  guardianRequestId?: string;
}

export interface AuthMeResponse {
  id: string;
  phone: string | null;
  email: string;
  status: UserStatusEnum | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  primaryRole: string;
  guardianship?: {
    required: boolean;
    approved: boolean;
  };
  isProfileComplete?: boolean;
  isProfileCompleted?: boolean;
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
    profileType?: string | null;
    primaryRole?: string | null;
    roleTag?: string | null;
    displayName: string;
    name?: string;
    avatarUrl: string | null;
    coverImageUrl?: string | null;
    coverUrl?: string | null;
    coverImageKey?: string | null;
    isMinor: boolean;
    accessLevel: 'LIMITED' | 'SUPERVISED' | 'FULL';
    verificationStatus: string;
    isProfileComplete?: boolean;
    isProfileCompleted?: boolean;
    firstName?: string;
    lastName?: string;
    bio?: string;
    city?: string;
    location?: string | null;
    dateOfBirth?: string;
    dob?: string | null;
    position?: string;
    shootsCatches?: string;
    jerseyNumber?: number | string | null;
    genderCategory?: string;
    height?: string | HeightValue | null;
    weight?: string | WeightValue | null;
    preferredLanguage?: string;
    defaultVisibility?: string;
    teamName?: string | null;
    team?: string | null;
    academyName?: string | null;
    currentTeam?: string | null;
    careerEntries?: CareerEntry[] | null;
    career?: CareerEntry[] | null;
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

// Mobile-only: the mobile app supports password-based login/reset in
// addition to the shared OTP flow above; web has no password field and
// never calls this.
export interface ForgotPasswordDTO {
  email: string;
}

export interface ForgotPasswordResponse {
  message?: string;
}
