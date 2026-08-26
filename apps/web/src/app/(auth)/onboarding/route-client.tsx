'use client';

import { GuestGuard } from '@/components/routing/guest-guard';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import { OnboardingPage } from '@/screens/onboarding-page';

export function RouteClient() {
  const { onNavigate } = useAppNavigation();
  return <GuestGuard><OnboardingPage onComplete={() => onNavigate('home')} /></GuestGuard>;
}
