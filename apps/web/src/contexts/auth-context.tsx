import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { QueryKeys, type AuthMeResponse, type OtpVerifyResponse } from '@my-hockey-network/contracts';
import { getMySupervisionPermissions, getProfile } from '@my-hockey-network/core';
import { webAuth } from '@/platform/auth-service';
import { webAuthStorage } from '@/platform/auth-storage';
import { globalQueryClient } from '@/query';
import { showToast as showCentralToast } from '@/utils/toast';
import { getLocalAvatar } from '@/utils/local-avatar-storage';

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
  const isLoggingOut = useRef(false);
  const userRef = useRef<AuthMeResponse | null>(null);
  const hasBootstrappedRef = useRef(false);

  // The single choke point every `user` update goes through (`loadAuthMe`
  // success, `setUserProfile`) — the local-first avatar cache (feedback
  // 2026-08-29, see `@/utils/local-avatar-storage`) overrides
  // `profile.avatarUrl` here so every consumer of the auth-context `user`
  // (sidebar, Home feed's own-post identity, Edit Profile, ...) picks it up
  // for free, without each needing its own local-storage read.
  const updateUser = useCallback((nextUser: AuthMeResponse | null) => {
    const profileId = nextUser?.profile?.id;
    const localAvatar = profileId ? getLocalAvatar(profileId) : null;
    const patchedUser = nextUser && localAvatar && nextUser.profile
      ? { ...nextUser, profile: { ...nextUser.profile, avatarUrl: localAvatar } }
      : nextUser;
    userRef.current = patchedUser;
    setUser(patchedUser);
  }, []);

  const loadAuthMe = useCallback(async (silent = false, force = false): Promise<AuthMeResponse | null> => {
    if (isLoggingOut.current) return null;

    // Do not re-fetch /auth/me if already bootstrapped as logged out, unless explicitly forced
    if (hasBootstrappedRef.current && userRef.current === null && !force) {
      if (!silent) setIsLoading(false);
      return null;
    }

    if (!silent) setIsLoading(true);

    try {
      if (force) {
        await globalQueryClient.invalidateQueries({ queryKey: [QueryKeys.AUTH_ME] });
      }
      const profile = await globalQueryClient.fetchQuery<AuthMeResponse | null>({
        queryKey: [QueryKeys.AUTH_ME],
        queryFn: () => webAuth.getMe(),
        staleTime: 5 * 60 * 1000,
      });

      if (profile) {
        updateUser(profile);
        const myProfileId = profile.profile?.id || profile.id;
        if (myProfileId) {
          void globalQueryClient.fetchQuery({
            queryKey: [`${QueryKeys.USER_PROFILE}:${myProfileId}`],
            queryFn: () => getProfile(myProfileId),
            staleTime: 5 * 60 * 1000,
          });
        }
      }
      return profile;
    } catch {
      updateUser(null);
      return null;
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    void loadAuthMe().finally(() => {
      hasBootstrappedRef.current = true;
      setHasBootstrapped(true);
    });
  }, [loadAuthMe]);

  // Fetch GET /v1/supervision/me/permissions ONLY for minor players — the
  // endpoint (and this whole guardian-controls concept) only applies to
  // accounts under active guardian supervision. An 18+ adult player has no
  // guardian and no supervision controls to fetch; calling it for them was
  // a real bug (see docs/IMPLEMENTATION_STATUS.md) — the endpoint 400s for
  // a non-supervised account, and checkSupervisionPermission below used to
  // fail-closed (block everything) on that error/loading state regardless
  // of whether the user was ever supposed to be supervised in the first
  // place. `isParent`/`isCoach` alone were never sufficient: an adult
  // PLAYER is neither, and still isn't under supervision.
  useEffect(() => {
    async function loadMinorPermissions() {
      if (!user) {
        setSupervisionPermissions(null);
        return;
      }
      const isParent = user.primaryRole === 'PARENT' || user.roleAssignments?.some((assignment) => assignment.role === 'PARENT');
      const isCoach = user.primaryRole === 'COACH' || user.roleAssignments?.some((assignment) => assignment.role === 'COACH');
      const isMinor = Boolean(user.profile?.isMinor);

      if (!isParent && !isCoach && isMinor) {
        setIsSupervisionPermissionsLoading(true);
        try {
          const res = await globalQueryClient.fetchQuery({
            queryKey: [QueryKeys.SUPERVISION_PERMISSIONS],
            queryFn: () => getMySupervisionPermissions(),
            staleTime: 5 * 60 * 1000,
          });
          if (res?.controlsMap) {
            setSupervisionPermissions(res.controlsMap as Record<string, boolean>);
          }
        } catch {
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
      const isParent = user.primaryRole === 'PARENT' || user.roleAssignments?.some((assignment) => assignment.role === 'PARENT');
      const isCoach = user.primaryRole === 'COACH' || user.roleAssignments?.some((assignment) => assignment.role === 'COACH');
      const isMinor = Boolean(user.profile?.isMinor);

      // Parent, Coach, and any adult (non-minor) account always have full
      // permission — supervision controls only exist for a minor under
      // active guardian oversight. An 18+ player was never eligible for
      // this endpoint in the first place, so there's nothing to fail
      // closed against for them.
      if (isParent || isCoach || !isMinor) return true;

      // Minor permissions fail closed while unavailable or loading.
      if (!supervisionPermissions || isSupervisionPermissionsLoading) return false;

      const snakeKey = controlKey.replace(/([A-Z])/g, '_$1').toLowerCase();
      const camelKey = controlKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

      const val =
        supervisionPermissions[controlKey] ??
        supervisionPermissions[snakeKey] ??
        supervisionPermissions[camelKey];

      return val === true;
    },
    [user, supervisionPermissions, isSupervisionPermissionsLoading]
  );

  const assertSupervisionPermission = useCallback(
    (controlKey: string, allowedAction: () => void) => {
      if (!checkSupervisionPermission(controlKey)) {
        showCentralToast({ message: 'Your parent did not give permission for this feature.', type: 'error' });
        return;
      }
      allowedAction();
    },
    [checkSupervisionPermission]
  );

  useEffect(() => {
    const handleUnauthorized = () => {
      updateUser(null);
      setSession(null);
      showCentralToast({ message: 'Your session expired. Please sign in again.', type: 'error' });
    };
    window.addEventListener('mhn:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('mhn:unauthorized', handleUnauthorized);
  }, [updateUser]);

  const setAuthSession = (nextSession: OtpVerifyResponse) => {
    setSession(nextSession);
    void webAuthStorage.saveSession(nextSession);
    void loadAuthMe(false, true);
  };

  const handleLogout = async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    try {
      await webAuth.logout();
    } catch (err) {
      console.warn('[auth-context] Logout API call warning:', err);
    } finally {
      // Clear TanStack Query cache completely for all keys
      globalQueryClient.clear();

      // Clear auth storage session
      await webAuthStorage.clearSession();

      updateUser(null);
      setSession(null);
      setSupervisionPermissions(null);
      isLoggingOut.current = false;
      showCentralToast({ message: 'Logged out successfully.', type: 'success' });
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
        setUserProfile: updateUser,
        setAuthSession,
        loadAuthMe,
        handleLogout,
        hideToast: () => undefined,
        showToast: (message, type = 'error', actionText, onActionClick) =>
          showCentralToast({ message, type, actionText, onActionClick }),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
