import React from 'react';

export const SidebarWardSkeleton: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <style>{`
        @keyframes mhnWardShimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        .mhn-ward-shimmer-bg {
          background: linear-gradient(
            90deg,
            #F1F5F9 0%,
            #E2E8F0 30%,
            #F8FAFC 50%,
            #E2E8F0 70%,
            #F1F5F9 100%
          );
          background-size: 400px 100%;
          animation: mhnWardShimmer 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #F1F5F9',
          }}
        >
          {/* Avatar Skeleton */}
          <div
            className="mhn-ward-shimmer-bg"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />

          {/* Name & Age Text Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <div
              className="mhn-ward-shimmer-bg"
              style={{
                width: '65%',
                height: '14px',
                borderRadius: '4px',
              }}
            />
            <div
              className="mhn-ward-shimmer-bg"
              style={{
                width: '35%',
                height: '10px',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
