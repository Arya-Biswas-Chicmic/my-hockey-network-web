import React from 'react';
import { HomeSkeletonLoader } from '../features/home/HomeSkeletonLoader';

export const FullAppSkeletonLoader: React.FC = () => {
  return (
    <div className="mhn-app-skeleton-viewport" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header Skeleton Bar */}
      <header className="mhn-header" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 24px' }}>
        <div className="mhn-header-container" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo Shimmer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="mhn-skeleton-line mhn-shimmer-box" style={{ width: '140px', height: '32px', borderRadius: '8px' }} />
            <div className="mhn-skeleton-line mhn-shimmer-box" style={{ width: '220px', height: '36px', borderRadius: '20px' }} />
          </div>

          {/* Navigation Items Shimmer */}
          <div style={{ display: 'none', alignItems: 'center', gap: '32px' }}>
            <div className="mhn-skeleton-line mhn-shimmer-box" style={{ width: '60px', height: '24px', borderRadius: '6px' }} />
            <div className="mhn-skeleton-line mhn-shimmer-box" style={{ width: '60px', height: '24px', borderRadius: '6px' }} />
            <div className="mhn-skeleton-line mhn-shimmer-box" style={{ width: '60px', height: '24px', borderRadius: '6px' }} />
            <div className="mhn-skeleton-line mhn-shimmer-box" style={{ width: '60px', height: '24px', borderRadius: '6px' }} />
          </div>

          {/* Profile Avatar Shimmer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="mhn-skeleton-avatar mhn-shimmer-box" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          </div>
        </div>
      </header>

      {/* Main Layout Shimmer */}
      <main style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>
        <HomeSkeletonLoader />
      </main>
    </div>
  );
};
