export const paths = {
  home: '/',
  network: '/network',
  events: '/events',
  messaging: '/messaging',
  notifications: '/notifications',
  profile: '/profile',
  settings: '/settings',
  supervision: '/supervision',
  eventDetail: '/event-detail',
  auth: {
    onboarding: '/onboarding',
    guardian: '/guardian',
    sent: '/sent',
  },
} as const;

export type AppPaths = typeof paths;
