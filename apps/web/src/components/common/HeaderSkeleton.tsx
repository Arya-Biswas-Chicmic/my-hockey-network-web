import React from 'react';

export const HeaderSkeleton: React.FC = () => {
  return (
    <header className="mhn-header">
      <div className="mhn-header-container">
        {/* Left: Brand Logo Shimmer */}
        <div className="mhn-header-logo-area">
          <div className="mhn-header-shimmer-box mhn-header-shimmer-logo" />
        </div>

        {/* Center: Navigation Bar Shimmer */}
        <nav className="mhn-header-nav">
          {[
            { width: '42px' },
            { width: '72px' },
            { width: '46px' },
            { width: '64px' },
            { width: '76px' },
          ].map((item, index) => (
            <div
              key={index}
              className="mhn-header-shimmer-nav-item"
            >
              <div className="mhn-header-shimmer-box mhn-header-shimmer-icon" />
              <div className="mhn-header-shimmer-box mhn-header-shimmer-label" />
            </div>
          ))}
        </nav>

        {/* Right: User Profile Pill Shimmer */}
        <div className="mhn-header-user">
          <div className="mhn-header-shimmer-user-pill">
            <div className="mhn-header-shimmer-box mhn-header-shimmer-avatar" />
            <div className="mhn-header-shimmer-box mhn-header-shimmer-name" />
            <div className="mhn-header-shimmer-box mhn-header-shimmer-chevron" />
          </div>
        </div>
      </div>
    </header>
  );
};
