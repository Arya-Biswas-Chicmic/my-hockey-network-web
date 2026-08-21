import React from 'react';
import { GuestGuard } from '../guards/guest-guard';

export function withGuestGuard<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  return function WithGuestGuardWrapper(props: P) {
    return (
      <GuestGuard>
        <Component {...props} />
      </GuestGuard>
    );
  };
}
