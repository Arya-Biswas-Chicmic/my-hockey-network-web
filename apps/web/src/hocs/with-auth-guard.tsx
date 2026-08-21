import React from 'react';
import { AuthGuard } from '../guards/auth-guard';

export function withAuthGuard<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  return function WithAuthGuardWrapper(props: P) {
    return (
      <AuthGuard>
        <Component {...props} />
      </AuthGuard>
    );
  };
}
