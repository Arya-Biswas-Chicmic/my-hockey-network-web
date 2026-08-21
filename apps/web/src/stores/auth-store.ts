import { AuthMeResponse, getUserProfile, saveUserProfile, getAuthSession, saveAuthSession, clearAuthSession } from '@my-hockey-network/core';
import type { OtpVerifyResponse } from '../interfaces/api';

export class AuthStore {
  private static userProfile: AuthMeResponse | null = null;
  private static authSession: OtpVerifyResponse | null = null;

  static getUser(): AuthMeResponse | null {
    if (!this.userProfile) {
      this.userProfile = getUserProfile();
    }
    return this.userProfile;
  }

  static setUser(profile: AuthMeResponse | null): void {
    this.userProfile = profile;
    if (profile) {
      saveUserProfile(profile);
    }
  }

  static getSession(): OtpVerifyResponse | null {
    if (!this.authSession) {
      this.authSession = getAuthSession();
    }
    return this.authSession;
  }

  static setSession(session: OtpVerifyResponse | null): void {
    this.authSession = session;
    if (session) {
      saveAuthSession(session);
    }
  }

  static clear(): void {
    this.userProfile = null;
    this.authSession = null;
    clearAuthSession();
  }
}
