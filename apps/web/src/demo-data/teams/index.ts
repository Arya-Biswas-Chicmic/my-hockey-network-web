import detail from '@/demo-data/teams/detail.json';

export type TeamDetailTab = 'posts' | 'members' | 'events' | 'media' | 'about';

export interface DemoTeamPost {
  id: string;
  authorName: string;
  authorRole: string;
  authorTime: string;
  authorAvatar: string;
  content: string;
  postImage?: string;
  likesCount: number;
  commentsCount: number;
  repostCount: number;
}

export interface DemoTeamMember {
  id: string;
  name: string;
  position: string;
  jerseyNumber: string;
  avatar: string;
}

export interface DemoTeamEvent {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  interestedCount: string;
  goingCount: string;
  isInterested: boolean;
}

export interface DemoTeamLeague {
  id: string;
  name: string;
  subtitle: string;
  logo: string;
}

export interface DemoTeamDetail {
  id: string;
  name: string;
  logo: string;
  followerCount: string;
  tagline: string;
  stats: { leagues: number; trophies: number; members: number };
  posts: DemoTeamPost[];
  members: DemoTeamMember[];
  events: DemoTeamEvent[];
  media: { id: string; src: string; alt: string }[];
  about: {
    description: string;
    location: string;
    mapImage: string;
    leagues: DemoTeamLeague[];
  };
}

export const demoTeamDetail = detail as DemoTeamDetail;

/** Mirrors `getDemoGroupDetail` (`@/demo-data/groups`) — the teams list
 * passes whichever team row was clicked; the one fixture's rich content
 * (posts/members/events/media/about) stands in for every team until a real
 * per-team backend exists, with just the identity fields swapped. */
export function getDemoTeamDetail(teamId?: string, overrides?: { name?: string; logo?: string }): DemoTeamDetail {
  return {
    ...demoTeamDetail,
    id: teamId ?? demoTeamDetail.id,
    name: overrides?.name ?? demoTeamDetail.name,
    logo: overrides?.logo ?? demoTeamDetail.logo,
  };
}
