import type { ComponentType, SVGProps } from 'react';

export interface RoleOption {
  id: string;
  title: string;
  description: string;
  /** Traced icon component (see `@/components/icons/RoleIcons`) — not a
   * raster image path, so it can pick up `.role-icon-box`'s theme color via
   * `currentColor` instead of needing a separate light/dark asset. */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
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
