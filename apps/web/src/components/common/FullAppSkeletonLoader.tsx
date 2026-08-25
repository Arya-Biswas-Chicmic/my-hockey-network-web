import React from 'react';
import { HeaderSkeleton } from './HeaderSkeleton';
import { HomeSkeletonLoader } from '../features/home/HomeSkeletonLoader';

export const FullAppSkeletonLoader: React.FC = () => {
  return (
    <div className="mhn-app-skeleton-viewport">
      {/* Header Skeleton Bar */}
      <HeaderSkeleton />

      {/* Main Layout Shimmer */}
      <main className="mhn-app-skeleton-main">
        <HomeSkeletonLoader />
      </main>
    </div>
  );
};
