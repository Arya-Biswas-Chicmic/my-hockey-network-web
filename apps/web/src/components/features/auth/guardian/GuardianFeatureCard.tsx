import React from 'react';

interface GuardianFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const GuardianFeatureCard: React.FC<GuardianFeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="guardian-feature-card">
      <div className="guardian-feature-icon-box">{icon}</div>
      <div className="guardian-feature-text">
        <div className="guardian-feature-title">{title}</div>
        <div className="guardian-feature-desc">{description}</div>
      </div>
    </div>
  );
};
