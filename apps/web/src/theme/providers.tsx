import React, { ReactNode, useState, useEffect } from 'react';
import { AuthProvider } from '../contexts/auth-context';
import { ThemeProvider } from '../components/core/theme-provider';
import { ServerDownScreen } from '../components/common/server-down-screen';
import { Toast } from '../components/common/Toast';
import { ToastTypeEnum } from '@my-hockey-network/contracts';
import { TOAST_EVENT, type ToastOptions } from '../utils/toast';
import { QueryProvider, globalQueryClient } from '../query';
import type { ThemePreference } from './theme-cookie';

interface ProvidersProps {
  children: ReactNode;
  defaultTheme?: ThemePreference;
}

export function Providers({ children, defaultTheme }: ProvidersProps) {
  const [serverDownState, setServerDownState] = useState<{
    isDown: boolean;
    statusCode: number;
    message?: string;
  }>({
    isDown: false,
    statusCode: 502,
  });

  const [toastState, setToastState] = useState<ToastOptions | null>(null);

  useEffect(() => {
    const handleServerDown = (event: CustomEvent) => {
      setServerDownState({
        isDown: true,
        statusCode: event.detail?.statusCode || 502,
        message: event.detail?.message || 'Server is currently undergoing maintenance or unavailable.',
      });
    };

    const handleToast = (event: CustomEvent<ToastOptions>) => {
      if (event.detail && event.detail.message) {
        setToastState({
          message: event.detail.message,
          type: event.detail.type || ToastTypeEnum.ERROR,
          actionText: event.detail.actionText,
          onActionClick: event.detail.onActionClick,
          duration: event.detail.duration,
        });
      }
    };

    window.addEventListener('mhn:server-down' as any, handleServerDown);
    window.addEventListener(TOAST_EVENT as any, handleToast);
    return () => {
      window.removeEventListener('mhn:server-down' as any, handleServerDown);
      window.removeEventListener(TOAST_EVENT as any, handleToast);
    };
  }, []);

  const handleRetryConnection = async () => {
    const rawApiUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';
    const cleanBaseUrl = rawApiUrl.replace(/\/+$/, '');
    const targetPingUrl = cleanBaseUrl ? `${cleanBaseUrl}/v1/auth/me` : '/v1/auth/me';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(targetPingUrl, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'bypass-tunnel-reminder': 'true',
          'localtunnel-skip-warning': 'true',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.status < 500) {
        setServerDownState((prev) => ({ ...prev, isDown: false }));
        globalQueryClient.invalidateQueries('');
        return;
      }
      setServerDownState((prev) => ({
        ...prev,
        isDown: true,
        statusCode: res.status,
        message: `Backend service is still unavailable (HTTP ${res.status}). Please try again shortly.`,
      }));
    } catch {
      setServerDownState((prev) => ({
        ...prev,
        isDown: true,
        statusCode: 500,
        message: 'Backend server is still unreachable. Please check your network connection and try again.',
      }));
    }
  };

  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <QueryProvider>
        <AuthProvider>
          {children}

          {toastState && (
            <Toast
              message={toastState.message}
              type={toastState.type}
              actionText={toastState.actionText}
              onActionClick={toastState.onActionClick}
              duration={toastState.duration}
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
      </QueryProvider>
    </ThemeProvider>
  );
}
