import detail from '@/demo-data/groups/detail.json';

export type GroupDetailTab = 'posts' | 'about' | 'people' | 'events' | 'media' | 'files';

export interface DemoGroupPerson {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface DemoGroupPost {
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

export interface DemoGroupEvent {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  interestedCount: string;
  goingCount: string;
  isInterested: boolean;
}

export interface DemoGroupDetail {
  id: string;
  name: string;
  memberCount: string;
  coverImage: string;
  posts: DemoGroupPost[];
  about: {
    description: string;
    privacy: string;
    visibility: string;
    created: string;
    location: string;
  };
  people: DemoGroupPerson[];
  events: DemoGroupEvent[];
  media: { id: string; src: string; alt: string }[];
  files: { id: string; name: string; type: string; size: string; updated: string }[];
  admin: DemoGroupPerson;
  suggestedGroups: { id: string; name: string; members: string; image: string }[];
}

export interface DemoGroupCard {
  id: string;
  name: string;
  coverImage: string;
  memberCount: string;
  isMember: boolean;
}

export const demoGroupDetail = detail as DemoGroupDetail;

export const yourDemoGroups: readonly DemoGroupCard[] = [
  { id: 'grp-1', name: 'San Jose Sharks', coverImage: demoGroupDetail.coverImage, memberCount: '54.7K members', isMember: true },
  { id: 'grp-2', name: 'KC Blueknocks', coverImage: '/playHockey.webp', memberCount: '24.8K members', isMember: true },
  { id: 'grp-3', name: 'Toronto Maple Leafs', coverImage: '/event2.webp', memberCount: '850K members', isMember: true },
  { id: 'grp-4', name: 'Chicago Blackhawks', coverImage: '/classic.webp', memberCount: '620K members', isMember: true }
];

export const discoverDemoGroups: readonly DemoGroupCard[] = [
  { id: 'grp-5', name: 'New York Rangers', coverImage: '/event3.webp', memberCount: '780K members', isMember: false },
  { id: 'grp-6', name: 'Detroit Red Wings', coverImage: '/event4.webp', memberCount: '920K members', isMember: false },
  { id: 'grp-7', name: 'Montreal Canadiens', coverImage: '/event5.webp', memberCount: '1.2M members', isMember: false },
  { id: 'grp-8', name: 'Edmonton Oilers', coverImage: '/event6.webp', memberCount: '650K members', isMember: false }
];

export function getDemoGroupDetail(groupId?: string): DemoGroupDetail {
  return groupId && groupId !== demoGroupDetail.id
    ? { ...demoGroupDetail, id: groupId }
    : demoGroupDetail;
}
