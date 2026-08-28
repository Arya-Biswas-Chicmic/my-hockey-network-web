import eventsData from '@/demo-data/profile/events.json';
import feedData from '@/demo-data/profile/feed.json';
import mediaData from '@/demo-data/profile/media.json';
import peopleData from '@/demo-data/profile/people-you-may-know.json';
import profileData from '@/demo-data/profile/profiledata.json';
import statsData from '@/demo-data/profile/stats.json';
import teamsData from '@/demo-data/profile/teams.json';
import type { CareerEntry, PostItem } from '@my-hockey-network/core';
import type { FollowSuggestionUser } from '@/types/home.types';

export interface ProfileDemoMediaItem { id: string; src: string; alt: string }
export interface ProfileDemoEvent {
  id: string; title: string; image: string; date: string; location: string; interestedCount: string; goingCount: string;
}

export const profileDemoData = {
  profile: profileData,
  feed: feedData as PostItem[],
  media: mediaData as ProfileDemoMediaItem[],
  events: eventsData as ProfileDemoEvent[],
  stats: statsData,
  teams: teamsData as CareerEntry[],
  people: peopleData as FollowSuggestionUser[],
} as const;
