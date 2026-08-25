import React from 'react';

export const HeaderSkeleton: React.FC = () => {
  return (
    <header className="mhn-header">
      <div className="mhn-header-container">
        {/* Left: Brand Logo Shimmer */}
        <div className="mhn-header-logo-area">
          <div className="mhn-header-shimmer-box" style={{ width: '140px', height: '36px', borderRadius: '8px' }} />
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
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                height: '68px',
                padding: '0 20px',
              }}
            >
              <div className="mhn-header-shimmer-box" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
              <div className="mhn-header-shimmer-box" style={{ width: item.width, height: '10px', borderRadius: '3px' }} />
            </div>
          ))}
        </nav>

        {/* Right: User Profile Pill Shimmer */}
        <div className="mhn-header-user">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 12px 4px 4px',
              height: '40px',
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="mhn-header-shimmer-box" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <div className="mhn-header-shimmer-box" style={{ width: '60px', height: '12px', borderRadius: '4px' }} />
            <div className="mhn-header-shimmer-box" style={{ width: '12px', height: '12px', borderRadius: '3px' }} />
          </div>
        </div>
      </div>
    </header>
  );
};
