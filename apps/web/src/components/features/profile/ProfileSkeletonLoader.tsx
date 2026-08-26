import React from 'react';

export const ProfileSkeletonLoader: React.FC = () => {
  return (
    <div
      className="mhn-profile-main-container mhn-profile-skeleton-container"
      aria-busy="true"
      aria-label="Loading profile page"
    >
      {/* 1. Profile Hero Card Skeleton */}
      <div className="mhn-profile-hero-card mhn-profile-skeleton-hero">
        {/* Cover Banner Shimmer */}
        <div className="mhn-shimmer-box mhn-profile-skeleton-banner" />

        <div className="mhn-profile-header-content mhn-profile-skeleton-header-content">
          {/* Avatar & Action Row */}
          <div className="mhn-profile-skeleton-avatar-action-row">
            {/* Avatar Circle Shimmer */}
            <div className="mhn-shimmer-box mhn-profile-skeleton-avatar-large" />

            {/* Action Buttons Shimmer */}
            <div className="mhn-profile-skeleton-action-buttons">
              <div className="mhn-shimmer-box mhn-profile-skeleton-btn-pill" />
              <div className="mhn-shimmer-box mhn-profile-skeleton-btn-pill" />
            </div>
          </div>

          {/* User Info Block */}
          <div className="mhn-profile-skeleton-info-block">
            {/* Name & Role Badge Line */}
            <div className="mhn-profile-skeleton-title-row">
              <div className="mhn-shimmer-box mhn-profile-skeleton-name-w220" />
              <div className="mhn-shimmer-box mhn-profile-skeleton-badge-w90" />
            </div>

            {/* Position & Location Subtitle */}
            <div className="mhn-shimmer-box mhn-profile-skeleton-subtitle-w160" />

            {/* User Bio Paragraph Lines */}
            <div className="mhn-profile-skeleton-bio-stack">
              <div className="mhn-shimmer-box mhn-profile-skeleton-line-w80" />
              <div className="mhn-shimmer-box mhn-profile-skeleton-line-w50" />
            </div>
          </div>

          {/* Profile Stats Row */}
          <div className="mhn-profile-skeleton-stats-flex">
            <div className="mhn-shimmer-box mhn-profile-skeleton-stat-chip" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-stat-chip" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-stat-chip" />
          </div>

          {/* Profile Navigation Tabs Bar */}
          <div className="mhn-profile-skeleton-tabs-row">
            <div className="mhn-shimmer-box mhn-profile-skeleton-tab-item mhn-profile-skeleton-tab-active" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-tab-item" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-tab-item" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-tab-item" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-tab-item" />
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Grid Layout Skeleton */}
      <div className="mhn-profile-2col-layout mhn-mt-24">
        {/* Left Sidebar Column */}
        <aside className="mhn-profile-left-col mhn-profile-skeleton-left-col">
          {/* Card 1: Player Overview / Info */}
          <div className="mhn-profile-side-card mhn-profile-skeleton-card">
            <div className="mhn-shimmer-box mhn-profile-skeleton-card-title" />
            <div className="mhn-profile-skeleton-info-rows">
              <div className="mhn-profile-skeleton-info-row">
                <div className="mhn-shimmer-box mhn-profile-skeleton-icon-sm" />
                <div className="mhn-shimmer-box mhn-profile-skeleton-text-w120" />
              </div>
              <div className="mhn-profile-skeleton-info-row">
                <div className="mhn-shimmer-box mhn-profile-skeleton-icon-sm" />
                <div className="mhn-shimmer-box mhn-profile-skeleton-text-w100" />
              </div>
              <div className="mhn-profile-skeleton-info-row">
                <div className="mhn-shimmer-box mhn-profile-skeleton-icon-sm" />
                <div className="mhn-shimmer-box mhn-profile-skeleton-text-w140" />
              </div>
            </div>
          </div>

          {/* Card 2: Supervision Status / Info */}
          <div className="mhn-profile-side-card mhn-profile-skeleton-card">
            <div className="mhn-shimmer-box mhn-profile-skeleton-card-title" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-banner-sm" />
          </div>
        </aside>

        {/* Right Main Content Column */}
        <main className="mhn-profile-right-col mhn-profile-skeleton-right-col">
          {/* Create Post Box Skeleton */}
          <div className="mhn-create-post-card mhn-profile-skeleton-card">
            <div className="mhn-profile-skeleton-post-input-row">
              <div className="mhn-shimmer-box mhn-profile-skeleton-avatar-sm" />
              <div className="mhn-shimmer-box mhn-profile-skeleton-input-bar" />
            </div>
            <div className="mhn-profile-skeleton-post-actions-row">
              <div className="mhn-shimmer-box mhn-profile-skeleton-btn-sm" />
              <div className="mhn-shimmer-box mhn-profile-skeleton-btn-sm" />
              <div className="mhn-shimmer-box mhn-profile-skeleton-btn-sm" />
            </div>
          </div>

          {/* Feed Post Card 1 Skeleton */}
          <div className="mhn-feed-post-card mhn-profile-skeleton-card">
            <div className="mhn-profile-skeleton-post-header">
              <div className="mhn-shimmer-box mhn-profile-skeleton-avatar-md" />
              <div className="mhn-profile-skeleton-post-meta">
                <div className="mhn-shimmer-box mhn-profile-skeleton-text-w140" />
                <div className="mhn-shimmer-box mhn-profile-skeleton-text-w90" />
              </div>
            </div>
            <div className="mhn-profile-skeleton-post-body">
              <div className="mhn-shimmer-box mhn-profile-skeleton-line-w90" />
              <div className="mhn-shimmer-box mhn-profile-skeleton-line-w75" />
            </div>
            <div className="mhn-shimmer-box mhn-profile-skeleton-media-box" />
          </div>

          {/* Feed Post Card 2 Skeleton */}
          <div className="mhn-feed-post-card mhn-profile-skeleton-card">
            <div className="mhn-profile-skeleton-post-header">
              <div className="mhn-shimmer-box mhn-profile-skeleton-avatar-md" />
              <div className="mhn-profile-skeleton-post-meta">
                <div className="mhn-shimmer-box mhn-profile-skeleton-text-w140" />
                <div className="mhn-shimmer-box mhn-profile-skeleton-text-w90" />
              </div>
            </div>
            <div className="mhn-profile-skeleton-post-body">
              <div className="mhn-shimmer-box mhn-profile-skeleton-line-w85" />
              <div className="mhn-shimmer-box mhn-profile-skeleton-line-w60" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
