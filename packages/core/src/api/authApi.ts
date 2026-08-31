import { createAuthService } from '@my-hockey-network/auth';
import type { AuthStorageAdapter } from '@my-hockey-network/api-client';
import { apiFetch, getConfiguredApiClient, getConfiguredAuthStorage } from './client';
import { API_ENDPOINTS } from './urls';
export * from './signUpRules';
import type {
  OtpRequestDTO,
  OtpRequestResponse,
  OtpVerifyDTO,
  OtpVerifyResponse,
  OnboardingDTO,
  OnboardingResponse,
  AuthMeResponse,
  GuardianRequestResponse,
  ForgotPasswordDTO,
  ForgotPasswordResponse
} from './types';

function getSharedAuthService() {
  return createAuthService(getConfiguredApiClient(), getConfiguredAuthStorage());
}

/**
 * Request OTP via EMAIL or SMS (Shared for Web & Mobile - delegates to @my-hockey-network/auth)
 */
export async function requestOtp(dto: OtpRequestDTO, _clientType: 'web' | 'mobile' = 'web'): Promise<OtpRequestResponse> {
  return getSharedAuthService().requestOtp(dto);
}

/**
 * Verify OTP code (Shared for Web & Mobile - delegates to @my-hockey-network/auth)
 */
export async function verifyOtp(dto: OtpVerifyDTO, _clientType: 'web' | 'mobile' = 'web'): Promise<OtpVerifyResponse> {
  return getSharedAuthService().verifyOtp(dto);
}

/**
 * Submit onboarding profile data (Shared for Web & Mobile - delegates to @my-hockey-network/auth)
 */
export async function submitOnboarding(dto: OnboardingDTO, _clientType: 'web' | 'mobile' = 'web'): Promise<OnboardingResponse> {
  return getSharedAuthService().submitOnboarding(dto);
}

/**
 * Fetch current user session details & profile (Shared for Web & Mobile - delegates to @my-hockey-network/auth)
 */
export async function getAuthMe(_clientType: 'web' | 'mobile' = 'web'): Promise<AuthMeResponse> {
  return getSharedAuthService().getMe();
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
  height?: string;
  weight?: string;
  avatarUrl?: string;
  avatarKey?: string;
  coverImageKey?: string;
}

export type GenericAuthResponse = Record<string, unknown>;

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
 * Logout current device session (Shared for Web & Mobile - delegates to @my-hockey-network/auth)
 */
export async function logout(_clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  await getSharedAuthService().logout();
  return { message: 'Logged out successfully' };
}

/**
 * Send minor guardian connection request (Shared for Web & Mobile - delegates to @my-hockey-network/auth)
 */
export async function sendGuardianRequest(parentEmail: string, _clientType: 'web' | 'mobile' = 'web'): Promise<GuardianRequestResponse> {
  return getSharedAuthService().sendGuardianRequest(parentEmail);
}

/**
 * Request a password-reset email (Mobile-only — delegates to @my-hockey-network/auth. Web has no
 * password field and never calls this; it exists in the shared auth service purely so mobile can
 * reuse the same "Endpoints -> API services -> hooks -> components" layering as every other call.)
 */
export async function forgotPassword(dto: ForgotPasswordDTO, _clientType: 'web' | 'mobile' = 'mobile'): Promise<ForgotPasswordResponse> {
  return getSharedAuthService().forgotPassword(dto);
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
export async function verifyOrganizationInvite(inviteToken: string, clientType: 'web' | 'mobile' = 'web'): Promise<GenericAuthResponse> {
  return apiFetch<GenericAuthResponse>('/auth/organization/verify-invite', {
    method: 'POST',
    headers: { 'X-Invite-Token': inviteToken },
    body: JSON.stringify({}),
  }, clientType);
}

/**
 * Accept Organization Invite (Header: X-Invite-Token)
 */
export async function acceptOrganizationInvite(inviteToken: string, payload: Record<string, unknown>, clientType: 'web' | 'mobile' = 'web'): Promise<GenericAuthResponse> {
  return apiFetch<GenericAuthResponse>('/auth/organization/accept-invite', {
    method: 'POST',
    headers: { 'X-Invite-Token': inviteToken },
    body: JSON.stringify(payload),
  }, clientType);
}

/**
 * Verify Association Invite Token (Header: X-Invite-Token)
 */
export async function verifyAssociationInvite(inviteToken: string, clientType: 'web' | 'mobile' = 'web'): Promise<GenericAuthResponse> {
  return apiFetch<GenericAuthResponse>('/auth/association/verify-invite', {
    method: 'POST',
    headers: { 'X-Invite-Token': inviteToken },
    body: JSON.stringify({}),
  }, clientType);
}

/**
 * Accept Association Invite (Header: X-Invite-Token)
 */
export async function acceptAssociationInvite(inviteToken: string, payload: Record<string, unknown>, clientType: 'web' | 'mobile' = 'web'): Promise<GenericAuthResponse> {
  return apiFetch<GenericAuthResponse>('/auth/association/accept-invite', {
    method: 'POST',
    headers: { 'X-Invite-Token': inviteToken },
    body: JSON.stringify(payload),
  }, clientType);
}

/**
 * Verify Password Reset Token (Header: X-Reset-Token)
 */
export async function verifyPasswordResetToken(resetToken: string, orgOrAssoc: 'organization' | 'association' = 'organization', clientType: 'web' | 'mobile' = 'web'): Promise<GenericAuthResponse> {
  return apiFetch<GenericAuthResponse>(`/auth/${orgOrAssoc}/verify-password-reset`, {
    method: 'POST',
    headers: { 'X-Reset-Token': resetToken },
    body: JSON.stringify({}),
  }, clientType);
}

/**
 * Reset Password (Header: X-Reset-Token)
 */
export async function resetPasswordWithToken(resetToken: string, newPassword: string, orgOrAssoc: 'organization' | 'association' = 'organization', clientType: 'web' | 'mobile' = 'web'): Promise<GenericAuthResponse> {
  return apiFetch<GenericAuthResponse>(`/auth/${orgOrAssoc}/reset-password`, {
    method: 'POST',
    headers: { 'X-Reset-Token': resetToken },
    body: JSON.stringify({ newPassword }),
  }, clientType);
}
