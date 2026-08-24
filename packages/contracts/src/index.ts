export * from './urls';

export type ChannelType = 'EMAIL' | 'SMS';
export type AuthIntent = 'SIGNUP' | 'SIGNIN';
export type UserRole = 'PLAYER' | 'PARENT' | 'COACH' | 'STAFF';

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

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

export interface SignUpValidationResult {
  isValid: boolean;
  age?: number;
  isMinor: boolean;
  requiresParentApproval: boolean;
  error?: string;
}

export interface AuthMeResponse {
  id: string;
  phone: string | null;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  primaryRole: string;
  guardianship?: {
    required: boolean;
    approved: boolean;
  };
  isProfileComplete?: boolean;
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
