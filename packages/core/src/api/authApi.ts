import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';
import type {
  OtpRequestDTO,
  OtpRequestResponse,
  OtpVerifyDTO,
  OtpVerifyResponse,
  OnboardingDTO,
  OnboardingResponse,
  AuthMeResponse,
  GuardianRequestResponse
} from './types';

/**
 * Request OTP via EMAIL or SMS (Shared for Web & Mobile)
 */
export async function requestOtp(dto: OtpRequestDTO, clientType: 'web' | 'mobile' = 'web'): Promise<OtpRequestResponse> {
  return apiFetch<OtpRequestResponse>(API_ENDPOINTS.AUTH.OTP_REQUEST, {
    method: 'POST',
    body: JSON.stringify(dto),
  }, clientType);
}

/**
 * Verify OTP code (Shared for Web & Mobile)
 */
export async function verifyOtp(dto: OtpVerifyDTO, clientType: 'web' | 'mobile' = 'web'): Promise<OtpVerifyResponse> {
  return apiFetch<OtpVerifyResponse>(API_ENDPOINTS.AUTH.OTP_VERIFY, {
    method: 'POST',
    body: JSON.stringify(dto),
  }, clientType);
}

/**
 * Submit onboarding profile data (Shared for Web & Mobile)
 */
export async function submitOnboarding(dto: OnboardingDTO, clientType: 'web' | 'mobile' = 'web'): Promise<OnboardingResponse> {
  return apiFetch<OnboardingResponse>(API_ENDPOINTS.AUTH.ONBOARDING, {
    method: 'POST',
    body: JSON.stringify(dto),
  }, clientType);
}

/**
 * Fetch current user session details & profile (Shared for Web & Mobile)
 */
export async function getAuthMe(clientType: 'web' | 'mobile' = 'web'): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>(API_ENDPOINTS.AUTH.ME, {
    method: 'GET',
  }, clientType);
}

export interface UpdateProfileDTO {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  city?: string;
  dateOfBirth?: string;
  position?: string;
  shootsCatches?: string;
  jerseyNumber?: number;
  genderCategory?: string;
  avatarUrl?: string;
  avatarKey?: string;
  coverImageKey?: string;
}

/**
 * Update user profile details (PATCH /v1/auth/profile)
 */
export async function updateAuthProfile(dto: UpdateProfileDTO, clientType: 'web' | 'mobile' = 'web'): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>(API_ENDPOINTS.AUTH.PROFILE, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  }, clientType);
}

/**
 * Logout current device session (Shared for Web & Mobile)
 */
export async function logout(clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT, {
    method: 'POST',
  }, clientType);
}

/**
 * Send minor guardian connection request (Shared for Web & Mobile)
 */
export async function sendGuardianRequest(parentEmail: string, clientType: 'web' | 'mobile' = 'web'): Promise<GuardianRequestResponse> {
  return apiFetch<GuardianRequestResponse>(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_REQUESTS, {
    method: 'POST',
    body: JSON.stringify({ parentEmail }),
  }, clientType);
}

/**
 * Refresh Session (Header: X-Refresh-Token)
 */
export async function refreshAuthSession(refreshToken?: string, clientType: 'web' | 'mobile' = 'web'): Promise<OtpVerifyResponse> {
  const headers: Record<string, string> = {};
  if (refreshToken) {
    headers['X-Refresh-Token'] = refreshToken;
  }
  return apiFetch<OtpVerifyResponse>('/auth/refresh', {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  }, clientType);
}

/**
 * Verify Organization Invite Token (Header: X-Invite-Token)
 */
export async function verifyOrganizationInvite(inviteToken: string, clientType: 'web' | 'mobile' = 'web'): Promise<any> {
  return apiFetch<any>('/auth/organization/verify-invite', {
    method: 'POST',
    headers: { 'X-Invite-Token': inviteToken },
    body: JSON.stringify({}),
  }, clientType);
}

/**
 * Accept Organization Invite (Header: X-Invite-Token)
 */
export async function acceptOrganizationInvite(inviteToken: string, payload: Record<string, any>, clientType: 'web' | 'mobile' = 'web'): Promise<any> {
  return apiFetch<any>('/auth/organization/accept-invite', {
    method: 'POST',
    headers: { 'X-Invite-Token': inviteToken },
    body: JSON.stringify(payload),
  }, clientType);
}

/**
 * Verify Association Invite Token (Header: X-Invite-Token)
 */
export async function verifyAssociationInvite(inviteToken: string, clientType: 'web' | 'mobile' = 'web'): Promise<any> {
  return apiFetch<any>('/auth/association/verify-invite', {
    method: 'POST',
    headers: { 'X-Invite-Token': inviteToken },
    body: JSON.stringify({}),
  }, clientType);
}

/**
 * Accept Association Invite (Header: X-Invite-Token)
 */
export async function acceptAssociationInvite(inviteToken: string, payload: Record<string, any>, clientType: 'web' | 'mobile' = 'web'): Promise<any> {
  return apiFetch<any>('/auth/association/accept-invite', {
    method: 'POST',
    headers: { 'X-Invite-Token': inviteToken },
    body: JSON.stringify(payload),
  }, clientType);
}

/**
 * Verify Password Reset Token (Header: X-Reset-Token)
 */
export async function verifyPasswordResetToken(resetToken: string, orgOrAssoc: 'organization' | 'association' = 'organization', clientType: 'web' | 'mobile' = 'web'): Promise<any> {
  return apiFetch<any>(`/auth/${orgOrAssoc}/verify-password-reset`, {
    method: 'POST',
    headers: { 'X-Reset-Token': resetToken },
    body: JSON.stringify({}),
  }, clientType);
}

/**
 * Reset Password (Header: X-Reset-Token)
 */
export async function resetPasswordWithToken(resetToken: string, newPassword: string, orgOrAssoc: 'organization' | 'association' = 'organization', clientType: 'web' | 'mobile' = 'web'): Promise<any> {
  return apiFetch<any>(`/auth/${orgOrAssoc}/reset-password`, {
    method: 'POST',
    headers: { 'X-Reset-Token': resetToken },
    body: JSON.stringify({ newPassword }),
  }, clientType);
}
