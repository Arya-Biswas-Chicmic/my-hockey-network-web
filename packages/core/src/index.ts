import type { CreateAccountDTO, UserProfile } from '@my-hockey-network/types';

export * from './api/client';
export * from './api/types';
export * from './api/urls';
export * from './api/authApi';
export * from './api/postsApi';
export * from './api/relationshipsApi';
export * from './api/groupsApi';
export * from './api/organizationsApi';
export * from './api/supervisionApi';
export * from './api/approvalsApi';
export * from './api/alertsApi';
export * from './api/mediaApi';
export * from './api/settingsApi';
export * from './api/signUpRules';
export * from '@my-hockey-network/contracts';

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
