import type { ManagedChild, SupervisionControl } from '../interfaces/supervision';

export const MOCK_SUPERVISED_CHILDREN: ManagedChild[] = [
  {
    id: 'ward-mock-1',
    displayName: 'Steve Carter',
    firstName: 'Steve',
    lastName: 'Carter',
    age: 14,
    dateOfBirth: '2012-05-14',
    accessLevel: 'SUPERVISED',
  },
  {
    id: 'ward-mock-2',
    displayName: 'David Carter',
    firstName: 'David',
    lastName: 'Carter',
    age: 10,
    dateOfBirth: '2016-09-22',
    accessLevel: 'PARENT_MANAGED',
  },
];

export const MOCK_SUPERVISION_CONTROLS: SupervisionControl[] = [
  { control: 'ALLOW_DIRECT_MESSAGES', value: false, description: 'Direct messaging with unapproved accounts' },
  { control: 'REQUIRE_POST_APPROVAL', value: true, description: 'Parent approval before public feed posts' },
  { control: 'ALLOW_EXTERNAL_INVITES', value: false, description: 'Accepting team invites from external organizations' },
];
