import type { NetworkUserItem, NetworkGroupItem } from '../interfaces/relationship';

export const MOCK_SUGGESTED_USERS: NetworkUserItem[] = [
  {
    id: 'user-mock-1',
    displayName: 'David Miller',
    roleTag: 'Goalie • Toronto Marlboros',
    location: 'Toronto, ON',
    connectionStatus: 'NOT_CONNECTED',
    mutualConnectionsCount: 12,
  },
  {
    id: 'user-mock-2',
    displayName: 'Elena Rostova',
    roleTag: 'Coach • Mississauga Reps',
    location: 'Mississauga, ON',
    connectionStatus: 'NOT_CONNECTED',
    mutualConnectionsCount: 5,
  },
];

export const MOCK_GROUPS: NetworkGroupItem[] = [
  {
    id: 'group-mock-1',
    name: 'Ontario Youth Hockey League',
    description: 'Official group for Ontario youth hockey players, coaches, and parents.',
    membersCount: 1420,
    privacy: 'PUBLIC',
    isMember: true,
  },
  {
    id: 'group-mock-2',
    name: 'U18 Defensemen Tactics',
    description: 'Strategy discussions and video breakdowns for junior defensemen.',
    membersCount: 380,
    privacy: 'PRIVATE',
    isMember: false,
  },
];
