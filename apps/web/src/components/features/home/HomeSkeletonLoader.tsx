import React from 'react';

export const FeedPostSkeleton: React.FC = () => {
  return (
    <div className="mhn-post-figma-card mhn-feed-skeleton-card">
      {/* Header Row */}
      <div className="mhn-skeleton-row-between">
        <div className="mhn-skeleton-author-group">
          {/* Avatar Skeleton */}
          <div className="mhn-skeleton-avatar mhn-skeleton-avatar-lg" />
          {/* Name & Subtitle Skeleton */}
          <div className="mhn-skeleton-text-stack">
            <div className="mhn-skeleton-line mhn-skeleton-name-line" />
            <div className="mhn-skeleton-line mhn-skeleton-sub-line" />
          </div>
        </div>

        {/* 3 Dots Icon Placeholder */}
        <div className="mhn-skeleton-line mhn-skeleton-dots-icon" />
      </div>

      {/* Text Lines */}
      <div className="mhn-skeleton-body-lines">
        <div className="mhn-skeleton-line mhn-skeleton-body-l1" />
        <div className="mhn-skeleton-line mhn-skeleton-body-l2" />
      </div>

      {/* Media Box Skeleton */}
      <div className="mhn-skeleton-line mhn-skeleton-media-box" />

      {/* Footer Action Icons */}
      <div className="mhn-skeleton-actions-row">
        <div className="mhn-skeleton-action-item">
          <div className="mhn-skeleton-line mhn-skeleton-icon-circle" />
          <div className="mhn-skeleton-line mhn-skeleton-stat-text" />
        </div>

        <div className="mhn-skeleton-action-item">
          <div className="mhn-skeleton-line mhn-skeleton-icon-circle" />
          <div className="mhn-skeleton-line mhn-skeleton-stat-text" />
        </div>

        <div className="mhn-skeleton-action-item">
          <div className="mhn-skeleton-line mhn-skeleton-icon-circle" />
        </div>
      </div>
    </div>
  );
};

export const ProfileSummarySkeleton: React.FC = () => {
  return (
    <div className="mhn-profile-skeleton-card">
      <div className="mhn-skeleton-line animate-pulse mhn-profile-skeleton-cover" />
      <div className="mhn-skeleton-avatar animate-pulse mhn-profile-skeleton-avatar" />
      <div className="mhn-skeleton-line animate-pulse mhn-profile-skeleton-name" />
      <div className="mhn-skeleton-line animate-pulse mhn-profile-skeleton-role" />
      <div className="mhn-skeleton-line animate-pulse mhn-profile-skeleton-loc" />
      <div className="mhn-profile-skeleton-stats-row">
        <div className="mhn-skeleton-line animate-pulse mhn-profile-skeleton-stat-btn" />
        <div className="mhn-skeleton-line animate-pulse mhn-profile-skeleton-stat-btn" />
      </div>
      <div className="mhn-skeleton-line animate-pulse mhn-profile-skeleton-post-btn" />
    </div>
  );
};

export const WidgetSkeleton: React.FC = () => {
  return (
    <div className="mhn-widget-skeleton-card">
      <div className="mhn-skeleton-line animate-pulse mhn-widget-skeleton-title" />
      <div className="mhn-skeleton-line animate-pulse mhn-widget-skeleton-body" />
    </div>
  );
};

// Home is a 2-column layout (`.mhn-home-main-layout { grid-template-columns:
// 1fr 340px }`, see `index.css`) since the left nav column moved into the
// app shell's own `Sidebar.tsx` — this used to also render a
// `.mhn-layout-col-left`/`ProfileSummarySkeleton` third column left over
// from that older 3-column design, which no longer has a matching grid
// track to sit in.
export const HomeSkeletonLoader: React.FC = () => {
  return (
    <div className="mhn-home-main-layout">
      {/* Center Column */}
      <section className="mhn-layout-col-center mhn-col-flex-gap-16">
        <FeedPostSkeleton />
        <FeedPostSkeleton />
      </section>

      {/* Right Column */}
      <aside className="mhn-layout-col-right mhn-col-flex-gap-16">
        <WidgetSkeleton />
        <WidgetSkeleton />
      </aside>
    </div>
  );
};
