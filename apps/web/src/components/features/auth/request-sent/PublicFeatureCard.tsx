import React from 'react';

interface PublicFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

export const PublicFeatureCard: React.FC<PublicFeatureCardProps> = ({
  icon,
  title,
  description,
  onClick,
}) => {
  return (
    <div className="public-feature-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="public-feature-icon-badge">{icon}</div>
      <div className="public-feature-content">
        <h3 className="public-feature-title">{title}</h3>
        <p className="public-feature-desc">{description}</p>
      </div>
    </div>
  );
};
