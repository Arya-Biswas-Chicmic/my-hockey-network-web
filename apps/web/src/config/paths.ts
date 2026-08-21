export const PATHS = {
  HOME: '/home',
  NETWORK: '/network',
  EVENTS: '/events',
  MESSAGING: '/messaging',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SUPERVISION: '/supervision',
  ONBOARDING: '/onboarding',
  GUARDIAN: '/guardian',
  SENT: '/sent',
} as const;

export type AppPath = typeof PATHS[keyof typeof PATHS];
