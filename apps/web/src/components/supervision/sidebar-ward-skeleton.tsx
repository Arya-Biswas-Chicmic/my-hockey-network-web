import React from 'react';

export const SidebarWardSkeleton: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <div className="mhn-col-flex-gap-8 mhn-w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="mhn-ward-skeleton-item"
        >
          {/* Avatar Skeleton */}
          <div
            className="mhn-shimmer-box mhn-ward-skeleton-avatar"
          />

          {/* Name & Age Text Skeleton */}
          <div className="mhn-comment-skeleton-meta">
            <div
              className="mhn-shimmer-box mhn-ward-skeleton-name"
            />
            <div
              className="mhn-shimmer-box mhn-ward-skeleton-sub"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
