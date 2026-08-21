import React, { useEffect, ReactNode } from 'react';
import { AuthProvider, useAuth } from '../contexts/auth-context';
import { hasActiveToken } from '../services/auth-session';

function AuthBootstrap() {
  const { loadAuthMe } = useAuth();

  useEffect(() => {
    if (hasActiveToken()) {
      void loadAuthMe(true);
    }
  }, [loadAuthMe]);

  return null;
}

interface ProvidersProps {
  children: ReactNode;
  onNavigateToAuth?: () => void;
}

export function Providers({ children, onNavigateToAuth }: ProvidersProps) {
  return (
    <AuthProvider onNavigateToAuth={onNavigateToAuth}>
      <AuthBootstrap />
      {children}
    </AuthProvider>
  );
}
