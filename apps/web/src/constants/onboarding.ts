import type { RoleOption } from '@/types/onboarding';
import { RoleParentGuardianIcon, RolePlayerIcon, RoleCoachIcon } from '@/components/icons/RoleIcons';

export const DEFAULT_ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'parent',
    title: 'Parent / Guardian',
    description: 'Support my athlete on and off the ice',
    icon: RoleParentGuardianIcon,
  },
  {
    id: 'player',
    title: 'Player',
    description: 'I play hockey',
    icon: RolePlayerIcon,
  },
  {
    id: 'coach',
    title: 'Coach / Team Staff',
    description: 'I coach or support a team.',
    icon: RoleCoachIcon,
  },
];

export const DEFAULT_SELECTED_ROLE_IDS: string[] = ['parent'];
