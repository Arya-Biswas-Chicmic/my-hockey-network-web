import { AppShellSkeleton } from '@/components/common/FullAppSkeletonLoader';
import { ProfileSkeletonLoader } from '@/components/features/profile/ProfileSkeletonLoader';

export default function Loading() {
  return (
    <AppShellSkeleton>
      <ProfileSkeletonLoader />
    </AppShellSkeleton>
  );
}
