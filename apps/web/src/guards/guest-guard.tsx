import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Spinner } from '../components/common/Spinner';

interface GuestGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" color="#0B66C2" />
      </div>
    );
  }

  if (isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};
