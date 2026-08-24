import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthMeResponse, OtpVerifyResponse } from '@my-hockey-network/contracts';
import { getMySupervisionPermissions } from '@my-hockey-network/core';
import { Toast } from '../components/common/Toast';
import { webAuth } from '../platform/auth-service';
import { webAuthStorage } from '../platform/auth-storage';

export interface AuthContextType {
  user: AuthMeResponse | null;
  session: OtpVerifyResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasBootstrapped: boolean;
  supervisionPermissions: Record<string, boolean> | null;
  isSupervisionPermissionsLoading: boolean;
  checkSupervisionPermission: (controlKey: string) => boolean;
  assertSupervisionPermission: (controlKey: string, allowedAction: () => void) => void;
  setUserProfile: (profile: AuthMeResponse) => void;
  setAuthSession: (session: OtpVerifyResponse) => void;
  loadAuthMe: (silent?: boolean, force?: boolean) => Promise<AuthMeResponse | null>;
  handleLogout: () => Promise<void>;
  hideToast: () => void;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info',
    actionText?: string,
    onActionClick?: () => void
  ) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AuthMeResponse | null>(null);
  const [session, setSession] = useState<OtpVerifyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const [supervisionPermissions, setSupervisionPermissions] = useState<Record<string, boolean> | null>(null);
  const [isSupervisionPermissionsLoading, setIsSupervisionPermissionsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    actionText?: string;
    onActionClick?: () => void;
  } | null>(null);
  const authMePromise = useRef<Promise<AuthMeResponse | null> | null>(null);
  const isLoggingOut = useRef(false);

  const loadAuthMe = useCallback(async (silent = false, force = false): Promise<AuthMeResponse | null> => {
    if (isLoggingOut.current) return null;
    if (force) authMePromise.current = null;
    if (authMePromise.current) return authMePromise.current;

    // Do NOT hit /v1/auth/me on guest/onboarding pages or unless user has active access token / session cookie / active user state
    const token = webAuthStorage.getAccessToken();
    const hasSessionCookie =
      typeof document !== 'undefined' &&
      Boolean(document.cookie && /mhn_at|mhn_csrf|mhn_session|access_token|refresh_token|connect\.sid/i.test(document.cookie));

    const isGuestRoute =
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/onboarding') || window.location.pathname.startsWith('/login'));

    const hasStoredSession = Boolean(token || hasSessionCookie || user);

    if ((!hasStoredSession || (isGuestRoute && !user)) && !force) {
      if (!user) setUser(null);
      if (!silent) setIsLoading(false);
      return null;
    }

    if (!silent) setIsLoading(true);

    authMePromise.current = webAuth
      .getMe()
      .then((profile) => {
        if (profile) setUser(profile);
        return profile;
      })
      .catch((err: any) => {
        console.warn('GET /v1/auth/me error:', err?.message || err);
        setUser(null);
        return null;
      })
      .finally(() => {
        authMePromise.current = null;
        if (!silent) setIsLoading(false);
      });
    return authMePromise.current;
  }, []);

  useEffect(() => {
    void loadAuthMe().finally(() => setHasBootstrapped(true));
  }, [loadAuthMe]);

  // Fetch GET /v1/supervision/me/permissions ONLY for minor players (NOT for PARENT or COACH)
  useEffect(() => {
    async function loadMinorPermissions() {
      if (!user) {
        setSupervisionPermissions(null);
        return;
      }
      const isParent = user.primaryRole === 'PARENT' || user.roleAssignments?.some((r: any) => r.role === 'PARENT');
      const isCoach = user.primaryRole === 'COACH' || user.roleAssignments?.some((r: any) => r.role === 'COACH');

      // Do NOT hit for PARENT or COACH. Hit ONLY for PLAYER / Minor Wards.
      if (!isParent && !isCoach) {
        setIsSupervisionPermissionsLoading(true);
        try {
          const res = await getMySupervisionPermissions();
          if (res?.controlsMap) {
            setSupervisionPermissions(res.controlsMap as Record<string, boolean>);
          }
        } catch (err: any) {
          console.warn('Minor supervision permissions notice:', err?.message || err);
          setSupervisionPermissions(null);
        } finally {
          setIsSupervisionPermissionsLoading(false);
        }
      } else {
        setSupervisionPermissions(null);
        setIsSupervisionPermissionsLoading(false);
      }
    }

    loadMinorPermissions();
  }, [user]);

  const checkSupervisionPermission = useCallback(
    (controlKey: string): boolean => {
      if (!user) return true;
      const isParent = user.primaryRole === 'PARENT' || user.roleAssignments?.some((r: any) => r.role === 'PARENT');
      const isCoach = user.primaryRole === 'COACH' || user.roleAssignments?.some((r: any) => r.role === 'COACH');

      // Parent and Coach always have full permission
      if (isParent || isCoach) return true;

      // If user is a minor player and permissions are loaded
      if (!supervisionPermissions) return true;

      const snakeKey = controlKey.replace(/([A-Z])/g, '_$1').toLowerCase();
      const camelKey = controlKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

      const val =
        supervisionPermissions[controlKey] ??
        supervisionPermissions[snakeKey] ??
        supervisionPermissions[camelKey];

      return val !== false;
    },
    [user, supervisionPermissions]
  );

  const assertSupervisionPermission = useCallback(
    (controlKey: string, allowedAction: () => void) => {
      if (!checkSupervisionPermission(controlKey)) {
        setToast({ message: 'Your parent did not give permission for this feature.', type: 'error' });
        return;
      }
      allowedAction();
    },
    [checkSupervisionPermission]
  );

  useEffect(() => {
    const handleUnauthorized = () => {
      const token = webAuthStorage.getAccessToken();
      if (!token) {
        setUser(null);
        setSession(null);
        setToast({ message: 'Your session expired. Please sign in again.', type: 'error' });
      }
    };
    window.addEventListener('mhn:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('mhn:unauthorized', handleUnauthorized);
  }, []);

  const setAuthSession = (nextSession: OtpVerifyResponse) => {
    setSession(nextSession);
    void webAuthStorage.saveSession(nextSession);
    void loadAuthMe();
  };

  const handleLogout = async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    setIsLoading(true);
    try {
      await webAuth.logout();
    } finally {
      setUser(null);
      setSession(null);
      setIsLoading(false);
      isLoggingOut.current = false;
      setToast({ message: 'Logged out successfully.', type: 'success' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: user !== null,
        isLoading,
        hasBootstrapped,
        supervisionPermissions,
        isSupervisionPermissionsLoading,
        checkSupervisionPermission,
        assertSupervisionPermission,
        setUserProfile: setUser,
        setAuthSession,
        loadAuthMe,
        handleLogout,
        hideToast: () => setToast(null),
        showToast: (message, type = 'error', actionText, onActionClick) =>
          setToast({ message, type, actionText, onActionClick }),
      }}
    >
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          actionText={toast.actionText}
          onActionClick={toast.onActionClick}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
