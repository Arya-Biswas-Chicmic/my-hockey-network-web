import React from 'react';

export const ProfileSkeletonLoader: React.FC = () => {
  return (
    <div className="mhn-profile-main-container" style={{ padding: '0 0 24px 0' }}>
      <div className="mhn-profile-hero-card" style={{ overflow: 'hidden', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
        {/* Cover Banner Shimmer */}
        <div 
          className="mhn-shimmer-box" 
          style={{ width: '100%', height: '180px', borderRadius: '16px 16px 0 0' }} 
        />

        <div className="mhn-profile-header-content" style={{ padding: '0 24px 24px 24px', marginTop: '-50px' }}>
          {/* Avatar Shimmer Circle */}
          <div 
            className="mhn-shimmer-box" 
            style={{ width: '110px', height: '110px', borderRadius: '50%', border: '4px solid #FFFFFF' }} 
          />

          {/* User Name & Bio Shimmer */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="mhn-shimmer-box" style={{ width: '200px', height: '24px', borderRadius: '6px' }} />
            <div className="mhn-shimmer-box" style={{ width: '140px', height: '16px', borderRadius: '4px' }} />
            <div className="mhn-shimmer-box" style={{ width: '60%', height: '14px', borderRadius: '4px', marginTop: '4px' }} />
          </div>

          {/* Followers / Following Stats Shimmer */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
            <div className="mhn-shimmer-box" style={{ width: '90px', height: '18px', borderRadius: '4px' }} />
            <div className="mhn-shimmer-box" style={{ width: '90px', height: '18px', borderRadius: '4px' }} />
          </div>

          {/* Profile Navigation Tabs Shimmer */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '28px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
            <div className="mhn-shimmer-box" style={{ width: '70px', height: '20px', borderRadius: '4px' }} />
            <div className="mhn-shimmer-box" style={{ width: '70px', height: '20px', borderRadius: '4px' }} />
            <div className="mhn-shimmer-box" style={{ width: '70px', height: '20px', borderRadius: '4px' }} />
            <div className="mhn-shimmer-box" style={{ width: '70px', height: '20px', borderRadius: '4px' }} />
          </div>
        </div>
      </div>

      {/* Main Content Grid Shimmer */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="mhn-shimmer-box" style={{ width: '100%', height: '160px', borderRadius: '16px' }} />
        <div className="mhn-shimmer-box" style={{ width: '100%', height: '160px', borderRadius: '16px' }} />
      </div>
    </div>
  );
};
