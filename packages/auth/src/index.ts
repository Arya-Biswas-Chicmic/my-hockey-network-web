import type { ApiClient, AuthStorageAdapter } from '@my-hockey-network/api-client';
import type {
  AuthMeResponse,
  GuardianRequestResponse,
  OnboardingDTO,
  OnboardingResponse,
  OtpRequestDTO,
  OtpRequestResponse,
  OtpVerifyDTO,
  OtpVerifyResponse,
} from '@my-hockey-network/contracts';

export interface AuthService {
  requestOtp(dto: OtpRequestDTO): Promise<OtpRequestResponse>;
  verifyOtp(dto: OtpVerifyDTO): Promise<OtpVerifyResponse>;
  submitOnboarding(dto: OnboardingDTO): Promise<OnboardingResponse>;
  getMe(): Promise<AuthMeResponse>;
  logout(): Promise<void>;
  sendGuardianRequest(parentEmail: string): Promise<GuardianRequestResponse>;
}

export function createAuthService(client: ApiClient, storage: AuthStorageAdapter): AuthService {
  return {
    requestOtp: (dto) =>
      client.request('/auth/otp/request', { method: 'POST', body: JSON.stringify(dto) }),
    verifyOtp: async (dto) => {
      const session = await client.request<OtpVerifyResponse>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      await storage.saveSession(session);
      return session;
    },
    submitOnboarding: (dto) =>
      client.request('/auth/onboarding', { method: 'POST', body: JSON.stringify(dto) }),
    getMe: () => client.request('/auth/me'),
    logout: async () => {
      try {
        await client.request('/auth/logout', { method: 'POST' });
      } finally {
        await storage.clearSession();
      }
    },
    sendGuardianRequest: (parentEmail) =>
      client.request('/relationships/guardian-requests', {
        method: 'POST',
        body: JSON.stringify({ parentEmail }),
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
