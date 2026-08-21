export interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface OnboardingFormProps {
  roleOptions: RoleOption[];
  selectedRoles: string[];
  onToggleRole: (id: string) => void;
  onContinue: () => void;
}
