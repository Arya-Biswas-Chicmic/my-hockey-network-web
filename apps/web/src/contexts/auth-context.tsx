import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthMeResponse, OtpVerifyResponse } from '@my-hockey-network/contracts';
import { Toast } from '../components/common/Toast';
import { webAuth } from '../platform/auth-service';
import { webAuthStorage } from '../platform/auth-storage';

export interface AuthContextType {
  user: AuthMeResponse | null;
  session: OtpVerifyResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasBootstrapped: boolean;
  setUserProfile: (profile: AuthMeResponse) => void;
  setAuthSession: (session: OtpVerifyResponse) => void;
  loadAuthMe: (silent?: boolean) => Promise<AuthMeResponse | null>;
  handleLogout: () => Promise<void>;
  hideToast: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AuthMeResponse | null>(null);
  const [session, setSession] = useState<OtpVerifyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const authMePromise = useRef<Promise<AuthMeResponse | null> | null>(null);
  const isLoggingOut = useRef(false);

  const loadAuthMe = useCallback(async (silent = false): Promise<AuthMeResponse | null> => {
    if (isLoggingOut.current) return null;
    if (authMePromise.current) return authMePromise.current;
    if (!silent) setIsLoading(true);

    authMePromise.current = webAuth
      .getMe()
      .then((profile) => {
        setUser(profile);
        return profile;
      })
      .catch(() => {
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

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setSession(null);
      setToast({ message: 'Your session expired. Please sign in again.', type: 'error' });
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
        setUserProfile: setUser,
        setAuthSession,
        loadAuthMe,
        handleLogout,
        hideToast: () => setToast(null),
        showToast: (message, type = 'error') => setToast({ message, type }),
      }}
    >
      {children}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
