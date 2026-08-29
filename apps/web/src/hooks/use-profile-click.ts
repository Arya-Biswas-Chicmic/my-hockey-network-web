'use client';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { useShellUiStore, type OtherProfileClickTarget } from '@/stores/shell-ui-store';

/**
 * Shared "click a name/avatar" decision used by every profile-navigation
 * site (feed post authors, Who to Follow rows, Connections cards) — own
 * profile navigates to `/profile` as a normal page; anyone else opens the
 * in-place popup instead of a separate page (feedback 2026-08-30: "if mine
 * than redirect to profile page and if other user than redirect to other
 * user profile... don't make separate page"). Centralized here instead of
 * duplicated per click site.
 */
export function useProfileClickHandler() {
  const { user } = useAuth();
  const router = useRouter();
  const openOtherProfile = useShellUiStore((state) => state.openOtherProfile);

  return (target: OtherProfileClickTarget, isSelf?: boolean) => {
    // `mapFeedPosts.ts` already computes an accurate `isSelf` per post
    // (matching `feedReason`, several profileId/userId fields, AND the
    // "mine" demo-post special case) — callers that already have it should
    // pass it through rather than relying on a plain id comparison here,
    // which doesn't know about any of that and misclassifies the viewer's
    // own demo posts as someone else's.
    if (isSelf) {
      router.push('/profile');
      return;
    }
    if (!target.id) return;
    const ownProfileId = user?.profile?.id || user?.id;
    if (ownProfileId && target.id === ownProfileId) {
      router.push('/profile');
      return;
    }
    openOtherProfile(target);
  };
}
