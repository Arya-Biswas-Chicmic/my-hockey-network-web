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
 * Request OTP via EMAIL or SMS
 */
export async function requestOtp(dto: OtpRequestDTO): Promise<OtpRequestResponse> {
  return apiFetch<OtpRequestResponse>('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Verify OTP code
 */
export async function verifyOtp(dto: OtpVerifyDTO): Promise<OtpVerifyResponse> {
  return apiFetch<OtpVerifyResponse>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Submit onboarding profile data (roles, dateOfBirth, etc.)
 */
export async function submitOnboarding(dto: OnboardingDTO): Promise<OnboardingResponse> {
  return apiFetch<OnboardingResponse>('/auth/onboarding', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Fetch current user session details & profile
 */
export async function getAuthMe(): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>('/auth/me', {
    method: 'GET',
  });
}

/**
 * Logout current device session
 */
export async function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/logout', {
    method: 'POST',
  });
}

/**
 * Send minor guardian connection request (Child -> Parent)
 */
export async function sendGuardianRequest(parentEmail: string): Promise<GuardianRequestResponse> {
  return apiFetch<GuardianRequestResponse>('/relationships/guardian-requests', {
    method: 'POST',
    body: JSON.stringify({ parentEmail }),
  });
}
