export type RoleId = 'parent' | 'player' | 'coach';

export interface RoleOption {
  id: RoleId | string;
  title: string;
  description: string;
  icon: string;
}

export interface OnboardingState {
  selectedRoles: string[];
  isCompleted: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: string[];
  dob?: string;
  avatarUrl?: string;
}

export interface CreateAccountDTO {
  fullName: string;
  email: string;
  dob: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
  user?: UserProfile;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
