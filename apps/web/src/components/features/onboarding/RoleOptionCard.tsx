import React from 'react';
import type { RoleOptionCardProps } from '@/types/onboarding';

export const RoleOptionCard: React.FC<RoleOptionCardProps> = ({
  role,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect(role.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(role.id);
        }
      }}
      className={`role-card ${isSelected ? 'role-card-selected' : ''}`}
    >
      <div className="role-content-left">
        {/* Role Icon */}
        <div className="role-icon-box">
          <img
            src={role.icon}
            alt={role.title}
            className="role-icon-img"
          />
        </div>

        {/* Role Description */}
        <div>
          <h3 className="role-title">{role.title}</h3>
          <p className="role-description">{role.description}</p>
        </div>
      </div>

      {/* Custom Checkbox Image */}
      <div className="checkbox-img-box">
        <img
          src={isSelected ? '/checked.png' : '/unchecked.png'}
          alt={isSelected ? 'Checked' : 'Unchecked'}
          className="checkbox-img"
        />
      </div>
    </div>
  );
};
