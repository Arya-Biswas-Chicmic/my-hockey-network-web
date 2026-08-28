import React from 'react';
import { SidebarSkeleton } from '@/components/common/SidebarSkeleton';
import { HomeSkeletonLoader } from '@/components/features/home/HomeSkeletonLoader';

/**
 * The authenticated app chrome (sidebar + content well) as a loading
 * placeholder, with the per-route content skeleton passed in.
 *
 * Renders through the real `.mhn-app-shell`/`.mhn-app-content` classes so it
 * swaps in without a layout shift.
 */
export const AppShellSkeleton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mhn-app-shell">
    <SidebarSkeleton />
    <div className="mhn-app-content">
      {children}
    </div>
  </div>
);

/**
 * Default loading state for the `(authenticated)` route group.
 *
 * This used to be the app's single root `loading.tsx` and picked its content
 * skeleton by reading `usePathname()`. Both of those were wrong:
 *
 * - At the root it also covered `(auth)` and `(public)`, so signed-out visitors
 *   loading `/onboarding` or a public profile saw a fake logged-in app — sidebar,
 *   feed, right rail — before the real centered page replaced it. Each route
 *   group now owns its own `loading.tsx`.
 * - The pathname branching needed `'use client'` and a hydration-mismatch
 *   workaround, and its `/my-network` branch never matched anything because the
 *   real route is `/network` — so network loads silently fell back to the Home
 *   skeleton. Those branches are now per-route `loading.tsx` files, which is
 *   Next's own mechanism for this and needs no client-side pathname sniffing.
 */
export const FullAppSkeletonLoader: React.FC = () => (
  <AppShellSkeleton>
    <HomeSkeletonLoader />
  </AppShellSkeleton>
);
