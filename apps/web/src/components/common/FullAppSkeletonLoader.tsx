import React from 'react';
import { HeaderSkeleton } from './HeaderSkeleton';
import { HomeSkeletonLoader } from '../features/home/HomeSkeletonLoader';

export const FullAppSkeletonLoader: React.FC = () => {
  return (
    <div className="mhn-app-skeleton-viewport" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header Skeleton Bar */}
      <HeaderSkeleton />

      {/* Main Layout Shimmer */}
      <main style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>
        <HomeSkeletonLoader />
      </main>
    </div>
  );
};
