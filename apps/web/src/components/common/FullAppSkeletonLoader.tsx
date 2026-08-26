import React from 'react';
import { HeaderSkeleton } from '@/components/common/HeaderSkeleton';
import { HomeSkeletonLoader } from '@/components/features/home/HomeSkeletonLoader';
import { ProfileSkeletonLoader } from '@/components/features/profile/ProfileSkeletonLoader';
import { NetworkSkeletonGrid } from '@/components/features/network/NetworkSkeletonLoader';

export const FullAppSkeletonLoader: React.FC = () => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const renderContentSkeleton = () => {
    if (pathname.startsWith('/profile')) {
      return <ProfileSkeletonLoader />;
    }
    if (pathname.startsWith('/my-network')) {
      return (
        <div className="mhn-pt-24">
          <NetworkSkeletonGrid count={6} />
        </div>
      );
    }
    return <HomeSkeletonLoader />;
  };

  return (
    <div className="mhn-app-skeleton-viewport">
      <HeaderSkeleton />
      <div className="mhn-app-body-skeleton-wrapper">
        {renderContentSkeleton()}
      </div>
    </div>
  );
};
