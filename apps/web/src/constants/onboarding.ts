import type { RoleOption } from '@/types/onboarding';

export const DEFAULT_ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'parent',
    title: 'Parent / Guardian',
    description: 'Support my athlete on and off the ice',
    icon: '/parents.png',
  },
  {
    id: 'player',
    title: 'Player',
    description: 'I play hockey',
    icon: '/player.png',
  },
  {
    id: 'coach',
    title: 'Coach / Team Staff',
    description: 'I coach or support a team.',
    icon: '/CoachTeam.png',
  },
];

export const DEFAULT_SELECTED_ROLE_IDS: string[] = ['parent'];
