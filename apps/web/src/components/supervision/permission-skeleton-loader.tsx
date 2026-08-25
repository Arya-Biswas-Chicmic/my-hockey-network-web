import React from 'react';

export const PermissionSkeletonLoader: React.FC = () => {
  return (
    <div className="mhn-col-flex-gap-16 mhn-w-full">
      {[1, 2, 3].map((cardKey) => (
        <div
          key={cardKey}
          className="mhn-perm-skeleton-card"
        >
          {/* Accordion Header Skeleton */}
          <div
            className="mhn-perm-skeleton-header"
          >
            <div className="mhn-btn-loading-flex">
              <div
                className="mhn-shimmer-box mhn-perm-skeleton-icon"
              />
              <div
                className="mhn-shimmer-box mhn-perm-skeleton-title"
              />
            </div>
            <div
              className="mhn-shimmer-box mhn-perm-skeleton-chevron"
            />
          </div>

          {/* Permission Rows Skeleton */}
          <div className="mhn-perm-skeleton-rows-container">
            {[1, 2, 3, 4].map((rowKey) => (
              <div
                key={rowKey}
                className={`mhn-perm-skeleton-row ${rowKey === 4 ? 'last-row' : ''}`}
              >
                {/* Title & Subtitle Stack */}
                <div className="mhn-comment-skeleton-meta">
                  <div
                    className="mhn-shimmer-box mhn-comment-skeleton-name"
                  />
                  <div
                    className="mhn-shimmer-box mhn-comment-skeleton-body"
                  />
                </div>

                {/* Right Toggle Switch Skeleton */}
                <div
                  className="mhn-shimmer-box mhn-perm-skeleton-toggle"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
