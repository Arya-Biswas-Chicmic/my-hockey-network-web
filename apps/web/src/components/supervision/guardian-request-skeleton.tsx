import React from 'react';

export const GuardianRequestSkeleton: React.FC = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        marginTop: '16px',
      }}
    >
      {[1, 2, 3].map((key) => (
        <div
          key={key}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer animation Overlay */}
          <style>{`
            @keyframes mhnShimmer {
              0% { background-position: -200px 0; }
              100% { background-position: 200px 0; }
            }
            .mhn-shimmer-bg {
              background: linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%);
              background-size: 400px 100%;
              animation: mhnShimmer 1.5s infinite linear;
            }
          `}</style>

          {/* Shimmer Avatar */}
          <div
            className="mhn-shimmer-bg"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              marginBottom: '14px',
            }}
          />

          {/* Shimmer Name */}
          <div
            className="mhn-shimmer-bg"
            style={{
              width: '130px',
              height: '18px',
              borderRadius: '6px',
              marginBottom: '8px',
            }}
          />

          {/* Shimmer Role */}
          <div
            className="mhn-shimmer-bg"
            style={{
              width: '80px',
              height: '14px',
              borderRadius: '4px',
              marginBottom: '12px',
            }}
          />

          {/* Shimmer Team Pill */}
          <div
            className="mhn-shimmer-bg"
            style={{
              width: '140px',
              height: '24px',
              borderRadius: '9999px',
              marginBottom: '12px',
            }}
          />

          {/* Shimmer Location */}
          <div
            className="mhn-shimmer-bg"
            style={{
              width: '160px',
              height: '14px',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          />

          {/* Shimmer Buttons Row */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              width: '100%',
              marginTop: 'auto',
            }}
          >
            <div
              className="mhn-shimmer-bg"
              style={{
                flex: 1,
                height: '38px',
                borderRadius: '8px',
              }}
            />
            <div
              className="mhn-shimmer-bg"
              style={{
                flex: 1.4,
                height: '38px',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
