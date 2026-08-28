import { AppShellSkeleton } from '@/components/common/FullAppSkeletonLoader';
import { NetworkSkeletonGrid } from '@/components/features/network/NetworkSkeletonLoader';

export default function Loading() {
  return (
    <AppShellSkeleton>
      <div className="mhn-pt-24">
        <NetworkSkeletonGrid count={6} />
      </div>
    </AppShellSkeleton>
  );
}
