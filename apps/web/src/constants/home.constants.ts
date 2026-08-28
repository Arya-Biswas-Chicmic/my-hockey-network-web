import { HomeFeedTab, HomeFeedTabOption } from '@/types/home.types';

export { HomeFeedTab };

export const HOME_FEED_TABS: HomeFeedTabOption[] = [
  { key: HomeFeedTab.FOR_YOU, label: 'For You' },
  { key: HomeFeedTab.NETWORK, label: 'Network' },
  { key: HomeFeedTab.GROUPS, label: 'Groups' },
] as const;

export const DEFAULT_FEED_LIMIT = 20;
export const SEARCH_DEBOUNCE_MS = 800;

export const DEFAULT_INVITE_CARD_CONFIG = {
  title: 'Invite & Grow',
  description: 'Invite players, coaches, and families to grow your hockey network.',
  ctaText: 'Invite Now',
  illustrationUrl: '/InviteGrow.webp',
} as const;
