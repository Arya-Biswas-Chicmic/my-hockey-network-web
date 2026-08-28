import React from 'react';
import { Button } from '@/components/common/Button';
import type { RoleOptionCardProps } from '@/types/onboarding';

export const RoleOptionCard: React.FC<RoleOptionCardProps> = ({
  role,
  isSelected,
  onSelect,
}) => {
  const RoleIcon = role.icon;

  return (
    <Button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(role.id)}
      className={`role-card ${isSelected ? 'role-card-selected' : ''}`}
    >
      <div className="role-content-left">
        {/* Role Icon — traced SVG, not a raster image, so it inherits
            .role-icon-box's color via currentColor. */}
        <div className="role-icon-box">
          <RoleIcon aria-hidden="true" className="role-icon-img" />
        </div>

        {/* Role Description */}
        <div>
          <h3 className="role-title">{role.title}</h3>
          <p className="role-description">{role.description}</p>
        </div>
      </div>

      <div className="role-radio" aria-hidden="true">
        {isSelected ? <span className="role-radio-dot" /> : null}
      </div>
    </Button>
  );
};
