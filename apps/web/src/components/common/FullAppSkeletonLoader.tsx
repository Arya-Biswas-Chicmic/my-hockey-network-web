'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarSkeleton } from '@/components/common/SidebarSkeleton';
import { HomeSkeletonLoader } from '@/components/features/home/HomeSkeletonLoader';
import { ProfileSkeletonLoader } from '@/components/features/profile/ProfileSkeletonLoader';
import { NetworkSkeletonGrid } from '@/components/features/network/NetworkSkeletonLoader';

export const FullAppSkeletonLoader: React.FC = () => {
  // `usePathname()`, not `typeof window !== 'undefined' ?
  // window.location.pathname : ''` — that read `''` during SSR (always
  // falling through to `HomeSkeletonLoader`) but the real pathname on the
  // client, so the server-rendered and first-client-rendered HTML disagreed
  // whenever this mounted on any route but Home, causing a hydration
  // mismatch (surfaced in the console as "Hydration failed because the
  // server rendered HTML didn't match the client" on every route this way).
  // `usePathname()` returns the same value in both places.
  const pathname = usePathname() ?? '';

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

  // Renders through the real `.mhn-app-shell`/`.mhn-app-content` classes
  // (same as every actual page) so this swaps in without a layout shift —
  // previously used its own bespoke wrapper alongside a horizontal top-bar
  // skeleton left over from the app's pre-Sidebar design (see
  // `SidebarSkeleton.tsx`).
  return (
    <div className="mhn-app-shell">
      <SidebarSkeleton />
      <div className="mhn-app-content">
        {renderContentSkeleton()}
      </div>
    </div>
  );
};
