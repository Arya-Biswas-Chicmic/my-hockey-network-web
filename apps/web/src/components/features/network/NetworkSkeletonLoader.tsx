import React from 'react';

export const NetworkSkeletonCard: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      {/* Avatar Outer Circle Skeleton */}
      <div
        style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          padding: '3px',
          border: '2px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
        }}
      >
        <div
          className="mhn-skeleton-avatar"
          style={{ width: '100%', height: '100%', borderRadius: '50%' }}
        />
      </div>

      {/* Member Name Skeleton */}
      <div
        className="mhn-skeleton-line"
        style={{ width: '68%', height: '15px', borderRadius: '4px', marginBottom: '6px' }}
      />

      {/* Subtitle / Role Tag Skeleton */}
      <div
        className="mhn-skeleton-line"
        style={{ width: '45%', height: '11px', borderRadius: '4px', marginBottom: '10px' }}
      />

      {/* Team Pill Skeleton */}
      <div
        className="mhn-skeleton-line"
        style={{ width: '60%', height: '22px', borderRadius: '12px', marginBottom: '10px' }}
      />

      {/* Location Line Skeleton */}
      <div
        className="mhn-skeleton-line"
        style={{ width: '52%', height: '11px', borderRadius: '4px', marginBottom: '16px' }}
      />

      {/* Action Button Skeleton */}
      <div
        className="mhn-skeleton-line"
        style={{ width: '100%', height: '36px', borderRadius: '8px' }}
      />
    </div>
  );
};

export const NetworkSkeletonGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        width: '100%',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <NetworkSkeletonCard key={i} />
      ))}
    </div>
  );
};
