import React from 'react';

export const PermissionSkeletonLoader: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <style>{`
        @keyframes mhnPermShimmer {
          0% { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }
        .mhn-perm-shimmer-bg {
          background: linear-gradient(
            90deg,
            #F1F5F9 0%,
            #E2E8F0 30%,
            #F8FAFC 50%,
            #E2E8F0 70%,
            #F1F5F9 100%
          );
          background-size: 600px 100%;
          animation: mhnPermShimmer 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {[1, 2, 3].map((cardKey) => (
        <div
          key={cardKey}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Accordion Header Skeleton */}
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #F1F5F9',
              backgroundColor: '#FAFAFA',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                className="mhn-perm-shimmer-bg"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                }}
              />
              <div
                className="mhn-perm-shimmer-bg"
                style={{
                  width: '110px',
                  height: '18px',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div
              className="mhn-perm-shimmer-bg"
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* Permission Rows Skeleton */}
          <div style={{ padding: '0 20px' }}>
            {[1, 2, 3, 4].map((rowKey) => (
              <div
                key={rowKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: rowKey === 4 ? 'none' : '1px solid #F8FAFC',
                }}
              >
                {/* Title & Subtitle Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    className="mhn-perm-shimmer-bg"
                    style={{
                      width: `${120 + (rowKey % 3) * 30}px`,
                      height: '15px',
                      borderRadius: '4px',
                    }}
                  />
                  <div
                    className="mhn-perm-shimmer-bg"
                    style={{
                      width: `${180 + (rowKey % 2) * 50}px`,
                      height: '11px',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                {/* Right Toggle Switch Skeleton */}
                <div
                  className="mhn-perm-shimmer-bg"
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    flexShrink: 0,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
