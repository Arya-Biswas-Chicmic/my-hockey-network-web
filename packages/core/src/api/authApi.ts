import { apiFetch } from './client';
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
  return apiFetch<OtpRequestResponse>('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify(dto),
  }, clientType);
}

/**
 * Verify OTP code (Shared for Web & Mobile)
 */
export async function verifyOtp(dto: OtpVerifyDTO, clientType: 'web' | 'mobile' = 'web'): Promise<OtpVerifyResponse> {
  return apiFetch<OtpVerifyResponse>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify(dto),
  }, clientType);
}

/**
 * Submit onboarding profile data (Shared for Web & Mobile)
 */
export async function submitOnboarding(dto: OnboardingDTO, clientType: 'web' | 'mobile' = 'web'): Promise<OnboardingResponse> {
  return apiFetch<OnboardingResponse>('/auth/onboarding', {
    method: 'POST',
    body: JSON.stringify(dto),
  }, clientType);
}

/**
 * Fetch current user session details & profile (Shared for Web & Mobile)
 */
export async function getAuthMe(clientType: 'web' | 'mobile' = 'web'): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>('/auth/me', {
    method: 'GET',
  }, clientType);
}

/**
 * Logout current device session (Shared for Web & Mobile)
 */
export async function logout(clientType: 'web' | 'mobile' = 'web'): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/logout', {
    method: 'POST',
  }, clientType);
}

/**
 * Send minor guardian connection request (Shared for Web & Mobile)
 */
export async function sendGuardianRequest(parentEmail: string, clientType: 'web' | 'mobile' = 'web'): Promise<GuardianRequestResponse> {
  return apiFetch<GuardianRequestResponse>('/relationships/guardian-requests', {
    method: 'POST',
    body: JSON.stringify({ parentEmail }),
  }, clientType);
}
