import type { CreateAccountDTO, UserProfile } from '@my-hockey-network/types';

export * from './api/client';
export * from './api/types';
export * from './api/authApi';

export const toggleRoleSelection = (currentRoles: string[], roleId: string): string[] => {
  if (currentRoles.includes(roleId)) {
    return currentRoles.filter((id) => id !== roleId);
  }
  return [...currentRoles, roleId];
};

export const formatRoleName = (roleId: string): string => {
  switch (roleId) {
    case 'parent':
      return 'Parent / Guardian';
    case 'player':
      return 'Player';
    case 'coach':
      return 'Coach / Team Staff';
    default:
      return roleId;
  }
};

export const mapCreateAccountDTOToUserProfile = (
  dto: CreateAccountDTO,
  selectedRoles: string[] = ['player']
): UserProfile => {
  return {
    id: `usr_${Date.now()}`,
    name: dto.fullName,
    email: dto.email,
    dob: dto.dob,
    roles: selectedRoles,
  };
};
