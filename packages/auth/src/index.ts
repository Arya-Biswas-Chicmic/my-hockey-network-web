import type { ApiClient, AuthStorageAdapter } from '@my-hockey-network/api-client';
import {
  API_ENDPOINTS,
  type AuthMeResponse,
  type ForgotPasswordDTO,
  type ForgotPasswordResponse,
  type GuardianRequestResponse,
  type OnboardingDTO,
  type OnboardingResponse,
  type OtpRequestDTO,
  type OtpRequestResponse,
  type OtpVerifyDTO,
  type OtpVerifyResponse,
} from '@my-hockey-network/contracts';

export interface AuthService {
  requestOtp(dto: OtpRequestDTO): Promise<OtpRequestResponse>;
  verifyOtp(dto: OtpVerifyDTO): Promise<OtpVerifyResponse>;
  submitOnboarding(dto: OnboardingDTO): Promise<OnboardingResponse>;
  getMe(): Promise<AuthMeResponse>;
  logout(): Promise<void>;
  sendGuardianRequest(parentEmail: string): Promise<GuardianRequestResponse>;
  /** Mobile-only password reset request; web has no password field and never calls this. */
  forgotPassword(dto: ForgotPasswordDTO): Promise<ForgotPasswordResponse>;
}

export function createAuthService(client: ApiClient, storage: AuthStorageAdapter): AuthService {
  return {
    requestOtp: (dto) =>
      client.request(API_ENDPOINTS.AUTH.OTP_REQUEST, { method: 'POST', body: JSON.stringify(dto) }),
    verifyOtp: async (dto) => {
      const session = await client.request<OtpVerifyResponse>(API_ENDPOINTS.AUTH.OTP_VERIFY, {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      await storage.saveSession(session);
      return session;
    },
    submitOnboarding: (dto) =>
      client.request(API_ENDPOINTS.AUTH.ONBOARDING, { method: 'POST', body: JSON.stringify(dto) }),
    getMe: () => client.request(API_ENDPOINTS.AUTH.ME),
    logout: async () => {
      try {
        await client.request(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
      } finally {
        await storage.clearSession();
      }
    },
    sendGuardianRequest: (parentEmail) =>
      client.request(API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_REQUESTS, {
        method: 'POST',
        body: JSON.stringify({ parentEmail }),
      }),
    forgotPassword: (dto) =>
      client.request(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
  };
}

// Compatibility helpers for UI-only consumers. Credentials remain platform-owned.
export function hasRole(user: { roles?: string[] } | null, role: string): boolean {
  return user?.roles?.includes(role) ?? false;
}

export function createAuthSession(_token: string, user?: unknown) {
  return { isAuthenticated: true, user: user ?? null, loginTimestamp: Date.now() };
}

export function clearAuthSession() {
  return { isAuthenticated: false, user: null, loginTimestamp: null };
}
