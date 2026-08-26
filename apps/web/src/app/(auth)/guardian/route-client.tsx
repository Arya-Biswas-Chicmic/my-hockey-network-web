'use client';

import { GuardianApprovalPage } from '@/screens/guardian-approval-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  const { onNavigate, onLogout } = useAppNavigation();
  return (
    <GuardianApprovalPage
      onSendSuccess={() => onNavigate('sent')}
      onSignOut={onLogout}
      onContactSupport={() => onNavigate('help')}
    />
  );
}
