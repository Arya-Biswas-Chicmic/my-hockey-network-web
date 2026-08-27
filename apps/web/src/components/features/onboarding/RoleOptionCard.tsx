import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/common/Button';
import type { RoleOptionCardProps } from '@/types/onboarding';

export const RoleOptionCard: React.FC<RoleOptionCardProps> = ({
  role,
  isSelected,
  onSelect,
}) => {
  return (
    <Button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(role.id)}
      className={`role-card ${isSelected ? 'role-card-selected' : ''}`}
    >
      <div className="role-content-left">
        {/* Role Icon */}
        <div className="role-icon-box">
          <Image
            src={role.icon}
            alt={role.title}
            width={50}
            height={48}
            className="role-icon-img"
          />
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
