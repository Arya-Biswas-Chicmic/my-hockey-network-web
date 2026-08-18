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
    PROFILE: '/auth/profile',
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
    GUARDIAN_REQUESTS_DECLINE: '/relationships/guardian-requests/decline',
    GUARDIAN_INVITES: '/relationships/guardian-invites',
    GUARDIAN_INVITES_PENDING: '/relationships/guardian-invites/pending',
    GUARDIAN_INVITES_ACCEPT: '/relationships/guardian-invites/accept',
    GUARDIAN_INVITES_DECLINE: '/relationships/guardian-invites/decline',
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
  GROUPS: {
    BASE: '/groups',
    GET_GROUP: (id: string) => `/groups/${id}`,
    JOIN: (id: string) => `/groups/${id}/join`,
    LEAVE: (id: string) => `/groups/${id}/leave`,
    MEMBERS: (id: string) => `/groups/${id}/members`,
    APPROVE_MEMBER: (id: string, memberId: string) => `/groups/${id}/members/${memberId}/approve`,
    FILES: (id: string) => `/groups/${id}/files`,
  },
  ORGANIZATIONS: {
    BASE: '/organizations',
    GET_ORG: (id: string) => `/organizations/${id}`,
  },
  SUPERVISION: {
    BASE: '/supervision',
    CHILDREN: '/supervision/children',
    CONTROLS: (minorId: string) => `/supervision/${minorId}/controls`,
    LOGS: (minorId: string) => `/supervision/${minorId}/logs`,
  },
  APPROVALS: {
    BASE: '/approvals',
    GET_APPROVAL: (id: string) => `/approvals/${id}`,
    APPROVE: (id: string) => `/approvals/${id}/approve`,
    DECLINE: (id: string) => `/approvals/${id}/decline`,
  },
  ALERTS: {
    BASE: '/alerts',
    UNREAD_COUNT: '/alerts/unread-count',
    READ: (id: string) => `/alerts/${id}/read`,
    READ_ALL: '/alerts/read-all',
  },
  MEDIA: {
    UPLOAD: '/media/upload',
  },
  RECOMMENDATIONS: {
    PEOPLE: '/recommendations/people',
    SUGGESTED: '/recommendations/suggested',
  },
} as const;
