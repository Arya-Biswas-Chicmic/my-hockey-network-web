'use client';

import { EventDetailPage } from '@/screens/event-detail-page';
import { useAppNavigation } from '@/hooks/use-app-navigation';

export function RouteClient() {
  const navigation = useAppNavigation();
  return <EventDetailPage {...navigation} onBack={() => navigation.onNavigate('events')} />;
}
