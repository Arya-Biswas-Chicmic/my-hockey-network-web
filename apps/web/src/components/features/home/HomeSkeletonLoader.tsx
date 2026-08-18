import React from 'react';

export const FeedPostSkeleton: React.FC = () => {
  return (
    <div
      className="mhn-post-figma-card"
      style={{
        padding: '20px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          {/* Avatar Skeleton */}
          <div
            className="mhn-skeleton-avatar"
            style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0 }}
          />
          {/* Name & Subtitle Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <div
              className="mhn-skeleton-line"
              style={{ width: '38%', height: '14px', borderRadius: '4px' }}
            />
            <div
              className="mhn-skeleton-line"
              style={{ width: '22%', height: '11px', borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* 3 Dots Icon Placeholder */}
        <div
          className="mhn-skeleton-line"
          style={{ width: '20px', height: '14px', borderRadius: '4px' }}
        />
      </div>

      {/* Text Lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="mhn-skeleton-line" style={{ width: '94%', height: '13px', borderRadius: '4px' }} />
        <div className="mhn-skeleton-line" style={{ width: '70%', height: '13px', borderRadius: '4px' }} />
      </div>

      {/* Media Box Skeleton */}
      <div
        className="mhn-skeleton-line"
        style={{ width: '100%', height: '220px', borderRadius: '12px' }}
      />

      {/* Footer Action Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', paddingTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="mhn-skeleton-line" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
          <div className="mhn-skeleton-line" style={{ width: '24px', height: '12px', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="mhn-skeleton-line" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
          <div className="mhn-skeleton-line" style={{ width: '24px', height: '12px', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="mhn-skeleton-line" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
        </div>
      </div>
    </div>
  );
};

export const ProfileSummarySkeleton: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div className="mhn-skeleton-line animate-pulse" style={{ width: '100%', height: '80px', borderRadius: '12px' }} />
      <div className="mhn-skeleton-avatar animate-pulse" style={{ width: '68px', height: '68px', borderRadius: '50%', marginTop: '-40px', border: '3px solid #FFF' }} />
      <div className="mhn-skeleton-line animate-pulse" style={{ width: '60%', height: '18px', borderRadius: '4px' }} />
      <div className="mhn-skeleton-line animate-pulse" style={{ width: '40%', height: '12px', borderRadius: '4px' }} />
      <div className="mhn-skeleton-line animate-pulse" style={{ width: '50%', height: '12px', borderRadius: '4px' }} />
      <div style={{ display: 'flex', width: '100%', gap: '16px', marginTop: '8px' }}>
        <div className="mhn-skeleton-line animate-pulse" style={{ flex: 1, height: '36px', borderRadius: '8px' }} />
        <div className="mhn-skeleton-line animate-pulse" style={{ flex: 1, height: '36px', borderRadius: '8px' }} />
      </div>
      <div className="mhn-skeleton-line animate-pulse" style={{ width: '100%', height: '40px', borderRadius: '8px', marginTop: '4px' }} />
    </div>
  );
};

export const WidgetSkeleton: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="mhn-skeleton-line animate-pulse" style={{ width: '50%', height: '16px', borderRadius: '4px' }} />
      <div className="mhn-skeleton-line animate-pulse" style={{ width: '100%', height: '70px', borderRadius: '10px' }} />
    </div>
  );
};

export const HomeSkeletonLoader: React.FC = () => {
  return (
    <div className="mhn-home-main-layout">
      {/* Left Column */}
      <aside className="mhn-layout-col-left">
        <ProfileSummarySkeleton />
      </aside>

      {/* Center Column */}
      <section className="mhn-layout-col-center" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FeedPostSkeleton />
        <FeedPostSkeleton />
      </section>

      {/* Right Column */}
      <aside className="mhn-layout-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <WidgetSkeleton />
        <WidgetSkeleton />
      </aside>
    </div>
  );
};
