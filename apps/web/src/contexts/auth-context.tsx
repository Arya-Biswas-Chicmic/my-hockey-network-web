import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Toast } from '../components/common/Toast';
import {
  AuthMeResponse,
  OtpVerifyResponse,
  getUserProfile,
  saveUserProfile,
  getAuthSession,
  saveAuthSession,
  clearAuthSession,
  getAuthMe,
  logout as logoutApi,
} from '@my-hockey-network/core';

export interface AuthToastConfig {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export interface AuthContextType {
  user: AuthMeResponse | null;
  session: OtpVerifyResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  toastMessage: string | null;
  setUserProfile: (profile: AuthMeResponse) => void;
  setAuthSession: (sessionData: OtpVerifyResponse) => void;
  loadAuthMe: (silent?: boolean) => Promise<AuthMeResponse | null>;
  handleLogout: () => Promise<void>;
  hideToast: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode; onNavigateToAuth?: () => void }> = ({
  children,
  onNavigateToAuth,
}) => {
  const [user, setUser] = useState<AuthMeResponse | null>(() => getUserProfile());
  const [session, setSession] = useState<OtpVerifyResponse | null>(() => getAuthSession());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastConfig, setToastConfig] = useState<AuthToastConfig | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    setToastConfig({ message, type });
  };

  const isLoggingOutRef = useRef<boolean>(false);
  const authMePromiseRef = useRef<Promise<AuthMeResponse | null> | null>(null);

  const setUserProfile = (profile: AuthMeResponse) => {
    setUser(profile);
    saveUserProfile(profile);
  };

  const loadAuthMe = React.useCallback(async (silent: boolean = false): Promise<AuthMeResponse | null> => {
    if (isLoggingOutRef.current) return null;
    
    // Return ongoing in-flight promise if /v1/auth/me is currently pending
    if (authMePromiseRef.current) {
      return authMePromiseRef.current;
    }

    if (!silent) setIsLoading(true);

    authMePromiseRef.current = (async () => {
      try {
        console.log(`🚀 [AuthContext] Fetching live GET /v1/auth/me (silent: ${silent})...`);
        const res = await getAuthMe();
        if (res) {
          setUser(res);
          saveUserProfile(res);
          console.log('✅ [AuthContext] Live Auth Me Data Loaded:', res);
          return res;
        }
        return null;
      } catch (err: any) {
        console.warn('⚠️ [AuthContext] Fetch Auth Me Notice:', err.message || err);
        return null;
      } finally {
        authMePromiseRef.current = null;
        if (!silent) setIsLoading(false);
      }
    })();

    return authMePromiseRef.current;
  }, []);

  const setAuthSession = (sessionData: OtpVerifyResponse) => {
    setSession(sessionData);
    saveAuthSession(sessionData);
    loadAuthMe();
  };

  const handleLogout = async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setIsLoading(true);

    setUser(null);
    setSession(null);
    clearAuthSession();

    try {
      console.log('🚀 [AuthContext] Hitting POST /v1/auth/logout API...');
      await logoutApi();
      console.log('✅ [AuthContext] Logout API call succeeded');
    } catch (err: any) {
      console.warn('⚠️ [AuthContext] Logout API Notice:', err.message || err);
    } finally {
      setIsLoading(false);
      isLoggingOutRef.current = false;
      setToastMessage('Logged out successfully');
      if (onNavigateToAuth) {
        onNavigateToAuth();
      }
    }
  };

  const hasLoadedAuthRef = useRef<boolean>(false);

  useEffect(() => {
    if (hasLoadedAuthRef.current) return;
    const hasToken = typeof localStorage !== 'undefined' && (localStorage.getItem('mhn_access_token') || localStorage.getItem('mhn_auth_session'));
    if (hasToken && !isLoggingOutRef.current) {
      hasLoadedAuthRef.current = true;
      loadAuthMe();
    }
  }, []);

  useEffect(() => {
    const handleUnauthorizedEvent = (event: CustomEvent) => {
      console.warn('🚨 [401 Unauthorized Event Intercepted]:', event.detail);
      if (!isLoggingOutRef.current) {
        setToastMessage('Session expired or Unauthorized (401). Logging out...');
        handleLogout();
      }
    };

    window.addEventListener('mhn:unauthorized' as any, handleUnauthorizedEvent);
    return () => {
      window.removeEventListener('mhn:unauthorized' as any, handleUnauthorizedEvent);
    };
  }, []);

  const hideToast = () => {
    setToastMessage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user || !!session,
        isLoading,
        toastMessage,
        setUserProfile,
        setAuthSession,
        loadAuthMe,
        handleLogout,
        hideToast,
        showToast,
      }}
    >
      {children}

      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type || 'error'}
          onClose={() => setToastConfig(null)}
        />
      )}

      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span>⚠️ {toastMessage}</span>
          <button
            onClick={hideToast}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
