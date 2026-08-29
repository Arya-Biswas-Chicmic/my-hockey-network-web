import type { PostItem } from '@my-hockey-network/core';

/**
 * Other-user profile popup demo data — feedback 2026-08-30: "make a dummy
 * data in json as discussed so that we can show other user profile similar
 * to the our profile". Keyed by the SAME `demo-person-*`/`demo-following-*`
 * ids already used by `WhoToFollowWidget`'s fallback
 * (`people-you-may-know.json`) and the Connections fixtures
 * (`connections.json`), so clicking one of those already-established
 * identities anywhere in the app resolves to the same rich profile here.
 * Any OTHER clicked person (one of the remaining demo connections, or a
 * real API author) still opens the popup — it just falls back to whatever
 * fields the click site already had (name/avatar/role/team/location) with
 * the rest of the profile showing its normal empty state, same as a real
 * account with unset fields. Never fabricate data for someone not listed
 * here — see docs/DEMO_DATA_POLICY.md.
 */
export interface OtherProfileDemoRecord {
  id: string;
  name: string;
  avatar: string;
  roleTag: string;
  position: string;
  jerseyNumber: string;
  teamName: string;
  city: string;
  dateOfBirth: string;
  bio: string;
  followers: number;
  following: number;
  /** Whether the viewer already follows this demo person — determines
   * whether the popup opens on a "Follow" or "Message" primary action. */
  isFollowing: boolean;
  posts: PostItem[];
}

const OTHER_PROFILE_DEMO_DATA: Record<string, OtherProfileDemoRecord> = {
  'demo-person-1': {
    id: 'demo-person-1',
    name: 'Connor McDavid',
    avatar: '/demo/profile/person-1.webp',
    roleTag: 'Centre',
    position: 'Center',
    jerseyNumber: '97',
    teamName: 'Edmonton Oilers',
    city: 'Edmonton, Canada',
    dateOfBirth: '1997-01-13',
    bio: 'Captain, Edmonton Oilers. Chasing another Cup run this season.',
    followers: 128400,
    following: 212,
    isFollowing: false,
    posts: [
      {
        id: 'demo-other-post-mcdavid-1',
        body: 'Great skate with the group today. Building chemistry heading into the season.',
        audience: 'PUBLIC',
        createdAt: '2026-08-27T18:00:00.000Z',
        author: { id: 'demo-person-1', displayName: 'Connor McDavid', avatarUrl: '/demo/profile/person-1.webp', roleTag: 'Centre', teamName: 'Edmonton Oilers' },
        likeCount: 4210,
        commentCount: 186,
      },
    ],
  },
  'demo-person-2': {
    id: 'demo-person-2',
    name: 'Sidney Crosby',
    avatar: '/demo/profile/person-2.webp',
    roleTag: 'Centre',
    position: 'Center',
    jerseyNumber: '87',
    teamName: 'Pittsburgh Penguins',
    city: 'Pittsburgh, USA',
    dateOfBirth: '1987-08-07',
    bio: 'Captain, Pittsburgh Penguins. Grateful for every game.',
    followers: 156200,
    following: 98,
    isFollowing: true,
    posts: [
      {
        id: 'demo-other-post-crosby-1',
        body: 'Back at it. Thank you to everyone who came out to watch practice this week.',
        audience: 'PUBLIC',
        createdAt: '2026-08-26T14:30:00.000Z',
        author: { id: 'demo-person-2', displayName: 'Sidney Crosby', avatarUrl: '/demo/profile/person-2.webp', roleTag: 'Centre', teamName: 'Pittsburgh Penguins' },
        likeCount: 3890,
        commentCount: 142,
      },
    ],
  },
  'demo-following-05': {
    id: 'demo-following-05',
    name: 'Jack Hughes',
    avatar: '/jack.webp',
    roleTag: 'Centre',
    position: 'Center',
    jerseyNumber: '86',
    teamName: 'New Jersey Devils',
    city: 'Newark, USA',
    dateOfBirth: '2001-05-14',
    bio: 'New Jersey Devils forward. Working on my faceoffs this summer.',
    followers: 84300,
    following: 340,
    isFollowing: true,
    posts: [
      {
        id: 'demo-other-post-hughes-1',
        body: 'Summer training is in full swing. Feeling faster every week.',
        audience: 'PUBLIC',
        createdAt: '2026-08-25T16:00:00.000Z',
        author: { id: 'demo-following-05', displayName: 'Jack Hughes', avatarUrl: '/jack.webp', roleTag: 'Centre', teamName: 'New Jersey Devils' },
        likeCount: 2760,
        commentCount: 94,
      },
    ],
  },
};

export function getOtherProfileDemoData(id: string | null | undefined): OtherProfileDemoRecord | null {
  if (!id) return null;
  return OTHER_PROFILE_DEMO_DATA[id] ?? null;
}
