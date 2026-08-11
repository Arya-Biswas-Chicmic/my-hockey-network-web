export interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export type RoleId = 'parent' | 'player' | 'coach';

export interface OnboardingFormProps {
  roleOptions: RoleOption[];
  selectedRoles: string[];
  onToggleRole: (id: string) => void;
  onContinue: () => void;
}

export interface RoleOptionCardProps {
  role: RoleOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}
