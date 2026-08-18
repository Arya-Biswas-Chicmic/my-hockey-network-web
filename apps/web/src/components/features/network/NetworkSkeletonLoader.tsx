import React from 'react';

export const NetworkSkeletonCard: React.FC = () => {
  return (
    <div className="mhn-skeleton-card">
      <div className="mhn-skeleton-avatar animate-pulse" />
      <div className="mhn-skeleton-body">
        <div className="mhn-skeleton-line mhn-skeleton-title animate-pulse" />
        <div className="mhn-skeleton-line mhn-skeleton-subtitle animate-pulse" />
        <div className="mhn-skeleton-line mhn-skeleton-badge animate-pulse" />
        <div className="mhn-skeleton-line mhn-skeleton-location animate-pulse" />
      </div>
      <div className="mhn-skeleton-actions">
        <div className="mhn-skeleton-btn animate-pulse" />
        <div className="mhn-skeleton-btn animate-pulse" />
      </div>
    </div>
  );
};

export const NetworkSkeletonGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="mhn-skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <NetworkSkeletonCard key={i} />
      ))}
    </div>
  );
};
