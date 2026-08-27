export enum HomeFeedTab {
  FOR_YOU = 'FOR_YOU',
  NETWORK = 'NETWORK',
  GROUPS = 'GROUPS',
}

export interface FollowSuggestionUser {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  isFollowing?: boolean;
}

export interface UpcomingEvent {
  id: string;
  month: string;
  day: string;
  title: string;
  time: string;
  location: string;
}

export interface InviteGrowConfig {
  title: string;
  description: string;
  ctaText: string;
  illustrationUrl: string;
}

export interface HomeFeedTabOption {
  key: HomeFeedTab;
  label: string;
}
