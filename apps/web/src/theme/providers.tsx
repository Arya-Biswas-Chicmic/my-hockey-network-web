import React, { ReactNode, useState, useEffect } from 'react';
import { AuthProvider } from '../contexts/auth-context';
import { ThemeProvider } from '../components/core/theme-provider';
import { ServerDownScreen } from '../components/common/server-down-screen';
import { Toast } from '../components/common/Toast';
import type { ThemePreference } from './theme-cookie';

interface ProvidersProps {
  children: ReactNode;
  defaultTheme?: ThemePreference;
  onNavigateToAuth?: () => void;
}

export function Providers({ children, defaultTheme, onNavigateToAuth }: ProvidersProps) {
  const [serverDownState, setServerDownState] = useState<{
    isDown: boolean;
    statusCode: number;
    message?: string;
  }>({
    isDown: false,
    statusCode: 502,
  });

  const [toastState, setToastState] = useState<{
    message: string;
    type?: 'success' | 'info' | 'error';
  } | null>(null);

  useEffect(() => {
    const handleServerDown = (event: CustomEvent) => {
      console.warn('🚨 [502/503 Server Down Intercepted]:', event.detail);
      setServerDownState({
        isDown: true,
        statusCode: event.detail?.statusCode || 502,
        message: event.detail?.message || 'Server is currently undergoing maintenance or unavailable.',
      });
    };

    const handleToast = (event: CustomEvent) => {
      console.log('🔔 [Toast Event Intercepted]:', event.detail);
      if (event.detail && event.detail.message) {
        setToastState({
          message: event.detail.message,
          type: event.detail.type || 'error',
        });
      }
    };

    window.addEventListener('mhn:server-down' as any, handleServerDown);
    window.addEventListener('mhn:toast' as any, handleToast);
    return () => {
      window.removeEventListener('mhn:server-down' as any, handleServerDown);
      window.removeEventListener('mhn:toast' as any, handleToast);
    };
  }, []);

  const handleRetryConnection = () => {
    setServerDownState((prev) => ({ ...prev, isDown: false }));
    window.location.reload();
  };

  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <AuthProvider onNavigateToAuth={onNavigateToAuth}>
        {children}

        {toastState && (
          <Toast
            message={toastState.message}
            type={toastState.type}
            onClose={() => setToastState(null)}
          />
        )}

        {serverDownState.isDown && (
          <ServerDownScreen
            statusCode={serverDownState.statusCode}
            message={serverDownState.message}
            onRetry={handleRetryConnection}
          />
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}

