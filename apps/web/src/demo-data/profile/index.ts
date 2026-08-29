import eventsData from '@/demo-data/profile/events.json';
import peopleData from '@/demo-data/profile/people-you-may-know.json';
import profileData from '@/demo-data/profile/profiledata.json';
import statsData from '@/demo-data/profile/stats.json';
import teamsData from '@/demo-data/profile/teams.json';
import type { CareerEntry } from '@my-hockey-network/core';
import type { FollowSuggestionUser } from '@/types/home.types';

export interface ProfileDemoEvent {
  id: string; title: string; image: string; date: string; location: string; interestedCount: string; goingCount: string;
}

// `feed`/`media` used to live here as their own standalone fixtures — moved
// to the shared `@/demo-data/feed` dataset (product direction 2026-08-29:
// "single data base will be used in multiple locations") so Profile Posts,
// Profile Media, Home feed, and Saved all read the same 30 records. Use
// `getMyDemoFeedRecords`/`toPostItem`/`getMyDemoMediaItems` from there
// instead of `profileDemoData.feed`/`.media`.
export const profileDemoData = {
  profile: profileData,
  events: eventsData as ProfileDemoEvent[],
  stats: statsData,
  teams: teamsData as CareerEntry[],
  people: peopleData as FollowSuggestionUser[],
} as const;
