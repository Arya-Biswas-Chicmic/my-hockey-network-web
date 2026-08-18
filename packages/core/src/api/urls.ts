/**
 * Centralized API URLs and Endpoints Catalog for My Hockey Network
 */

export const API_BASE_URL_DEFAULT = 'https://reposeful-kareen-controllingly.ngrok-free.dev/v1';

export const API_ENDPOINTS = {
  AUTH: {
    OTP_REQUEST: '/auth/otp/request',
    OTP_VERIFY: '/auth/otp/verify',
    ONBOARDING: '/auth/onboarding',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    ME: '/auth/me',
  },
  RELATIONSHIPS: {
    BASE: '/relationships',
    FOLLOW: '/relationships/follow',
    CONNECTIONS: '/relationships/connections',
    CONTACT_REQUESTS: '/relationships/contact-requests',
    AFFILIATIONS: '/relationships/affiliations',
    BLOCKS: '/relationships/blocks',
    GUARDIAN_REQUESTS: '/relationships/guardian-requests',
    GUARDIAN_REQUESTS_PENDING: '/relationships/guardian-requests/pending',
    GUARDIAN_REQUESTS_ACCEPT: '/relationships/guardian-requests/accept',
    GUARDIAN_INVITES: '/relationships/guardian-invites',
    GUARDIAN_INVITES_PENDING: '/relationships/guardian-invites/pending',
    GUARDIAN_INVITES_ACCEPT: '/relationships/guardian-invites/accept',
  },
  POSTS: {
    BASE: '/posts',
    FEED_HOME: '/feed',
    GET_POST: (id: string) => `/posts/${id}`,
    DELETE_POST: (id: string) => `/posts/${id}`,
    REPOST: (id: string) => `/posts/${id}/repost`,
    REACTIONS: (id: string) => `/posts/${id}/reactions`,
    COMMENTS: (id: string) => `/posts/${id}/comments`,
  },
  MEDIA: {
    UPLOAD: '/media/upload',
  },
  RECOMMENDATIONS: {
    PEOPLE: '/recommendations/people',
    SUGGESTED: '/recommendations/suggested',
  },
} as const;
