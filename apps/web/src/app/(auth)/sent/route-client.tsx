'use client';

import { useAppNavigation } from '@/hooks/use-app-navigation';
import { RequestSentPage } from '@/screens/request-sent-page';

export function RouteClient() {
  const { onNavigate } = useAppNavigation();
  return <RequestSentPage onComplete={() => onNavigate('home')} />;
}
