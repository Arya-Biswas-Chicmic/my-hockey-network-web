export const paths = {
  home: '/home',
  network: '/network',
  events: '/events',
  messaging: '/messaging',
  notifications: '/notifications',
  profile: '/profile',
  profileGuardianRequests: '/profile/guardian-requests',
  settings: '/settings',
  supervision: '/supervision',
  eventDetail: '/event-detail',
  help: '/help',
  explore: '/explore',
  groups: '/groups',
  teams: '/teams',
  saved: '/saved',
  auth: {
    onboarding: '/onboarding',
    guardian: '/guardian',
    sent: '/sent',
  },
} as const;

export type AppPaths = typeof paths;
