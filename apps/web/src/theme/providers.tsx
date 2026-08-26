'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/components/core/theme-provider';
import { ServerDownScreen } from '@/components/common/server-down-screen';
import { Toast } from '@/components/common/Toast';
import { API_ENDPOINTS, ToastTypeEnum } from '@my-hockey-network/contracts';
import { TOAST_EVENT, type ToastOptions } from '@/utils/toast';
import { QueryProvider, globalQueryClient } from '@/query';
import type { ThemePreference } from '@/theme/theme-cookie';
import { webApiClient } from '@/platform/api-client';
import { ApiError } from '@my-hockey-network/api-client';
import { configureWebPlatform } from '@/platform/api-client';

configureWebPlatform();

interface ProvidersProps {
  children: ReactNode;
  defaultTheme?: ThemePreference;
}

// Public profile routes must render even if an unrelated auth bootstrap
// read fails. `/` redirects to onboarding and is not a public content page.
function isPublicRoute(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith('/players/'));
}

export function Providers({ children, defaultTheme }: ProvidersProps) {
  const pathname = usePathname();
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
    const handleServerDown: EventListener = (rawEvent) => {
      const event = rawEvent as CustomEvent<{ statusCode?: number; message?: string }>;
      setServerDownState({
        isDown: true,
        statusCode: event.detail?.statusCode || 502,
        message: event.detail?.message || 'Server is currently undergoing maintenance or unavailable.',
      });
    };

    const handleToast: EventListener = (rawEvent) => {
      const event = rawEvent as CustomEvent<ToastOptions>;
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

    window.addEventListener('mhn:server-down', handleServerDown);
    window.addEventListener(TOAST_EVENT, handleToast);
    return () => {
      window.removeEventListener('mhn:server-down', handleServerDown);
      window.removeEventListener(TOAST_EVENT, handleToast);
    };
  }, []);

  const handleRetryConnection = async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);
    try {
      await webApiClient.request(API_ENDPOINTS.AUTH.ME, { signal: controller.signal });
      setServerDownState((prev) => ({ ...prev, isDown: false }));
      void globalQueryClient.invalidateQueries();
    } catch (error) {
      if (error instanceof ApiError && error.statusCode < 500) {
        setServerDownState((prev) => ({ ...prev, isDown: false }));
        return;
      }
      setServerDownState((prev) => ({
        ...prev,
        isDown: true,
        statusCode: 500,
        message: 'Backend server is still unreachable. Please check your network connection and try again.',
      }));
    } finally {
      window.clearTimeout(timeoutId);
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

          {serverDownState.isDown && !isPublicRoute(pathname) && (
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
