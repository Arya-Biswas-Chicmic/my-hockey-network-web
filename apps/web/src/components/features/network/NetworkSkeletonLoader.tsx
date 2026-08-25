import React from 'react';

export const NetworkSkeletonCard: React.FC = () => {
  return (
    <div className="mhn-network-skeleton-card">
      {/* Avatar Outer Circle Skeleton */}
      <div className="mhn-network-skeleton-avatar-wrapper">
        <div className="mhn-skeleton-avatar mhn-network-skeleton-avatar-img" />
      </div>

      {/* Member Name Skeleton */}
      <div className="mhn-skeleton-line mhn-network-skeleton-name" />

      {/* Subtitle / Role Tag Skeleton */}
      <div className="mhn-skeleton-line mhn-network-skeleton-role" />

      {/* Team Pill Skeleton */}
      <div className="mhn-skeleton-line mhn-network-skeleton-team" />

      {/* Location Line Skeleton */}
      <div className="mhn-skeleton-line mhn-network-skeleton-loc" />

      {/* Action Button Skeleton */}
      <div className="mhn-skeleton-line mhn-network-skeleton-btn" />
    </div>
  );
};

export const NetworkSkeletonGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="mhn-network-skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <NetworkSkeletonCard key={i} />
      ))}
    </div>
  );
};
