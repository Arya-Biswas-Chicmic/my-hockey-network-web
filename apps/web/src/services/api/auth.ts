import { apiFetch } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  OtpRequestDTO,
  OtpRequestResponse,
  OtpVerifyDTO,
  OtpVerifyResponse,
  OnboardingDTO,
  OnboardingResponse,
  AuthMeResponse,
  GuardianRequestResponse,
} from '../../interfaces/api';

/**
 * Request OTP via EMAIL or SMS
 */
export async function requestOtp(dto: OtpRequestDTO): Promise<OtpRequestResponse> {
  return apiFetch<OtpRequestResponse>(API_ENDPOINTS.AUTH.OTP_REQUEST, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Verify OTP code
 */
export async function verifyOtp(dto: OtpVerifyDTO): Promise<OtpVerifyResponse> {
  return apiFetch<OtpVerifyResponse>(API_ENDPOINTS.AUTH.OTP_VERIFY, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Submit onboarding profile data (roles, dateOfBirth, etc.)
 */
export async function submitOnboarding(dto: OnboardingDTO): Promise<OnboardingResponse> {
  return apiFetch<OnboardingResponse>(API_ENDPOINTS.AUTH.ONBOARDING, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Fetch current user session details & profile
 */
export async function getAuthMe(): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>(API_ENDPOINTS.AUTH.ME, {
    method: 'GET',
  });
}

/**
 * Logout current device session
 */
export async function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT, {
    method: 'POST',
  });
}

/**
 * Send minor guardian connection request (Child -> Parent)
 */
export async function sendGuardianRequest(parentEmail: string): Promise<GuardianRequestResponse> {
  return apiFetch<GuardianRequestResponse>(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_REQUESTS, {
    method: 'POST',
    body: JSON.stringify({ parentEmail }),
  });
}
