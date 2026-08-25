import React from 'react';

export const ProfileSkeletonLoader: React.FC = () => {
  return (
    <div className="mhn-profile-main-container mhn-profile-skeleton-container">
      <div className="mhn-profile-hero-card mhn-profile-skeleton-hero">
        {/* Cover Banner Shimmer */}
        <div 
          className="mhn-shimmer-box mhn-profile-skeleton-banner" 
        />

        <div className="mhn-profile-header-content mhn-profile-skeleton-header-content">
          {/* Avatar Shimmer Circle */}
          <div 
            className="mhn-shimmer-box mhn-profile-skeleton-avatar-large" 
          />

          {/* User Name & Bio Shimmer */}
          <div className="mhn-profile-skeleton-name-box">
            <div className="mhn-shimmer-box mhn-profile-skeleton-name-w200" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-role-w140" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-bio-w60" />
          </div>

          {/* Followers / Following Stats Shimmer */}
          <div className="mhn-profile-skeleton-stats-flex">
            <div className="mhn-shimmer-box mhn-profile-skeleton-stat-w90" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-stat-w90" />
          </div>

          {/* Profile Navigation Tabs Shimmer */}
          <div className="mhn-profile-skeleton-tabs-row">
            <div className="mhn-shimmer-box mhn-profile-skeleton-tab-w70" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-tab-w70" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-tab-w70" />
            <div className="mhn-shimmer-box mhn-profile-skeleton-tab-w70" />
          </div>
        </div>
      </div>

      {/* Main Content Grid Shimmer */}
      <div className="mhn-profile-skeleton-cards-stack">
        <div className="mhn-shimmer-box mhn-profile-skeleton-card-h160" />
        <div className="mhn-shimmer-box mhn-profile-skeleton-card-h160" />
      </div>
    </div>
  );
};
