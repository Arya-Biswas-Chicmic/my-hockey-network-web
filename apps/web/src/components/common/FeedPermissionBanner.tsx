'use client';

import React from 'react';
import { PendingBanner } from '@/components/common/PendingBanner';
import { resolveFeedPermissionCta, useFeedPermissions } from '@/hooks/use-feed-permissions';

export interface FeedPermissionBannerProps {
  onNavigate?: (screen: string) => void;
  /**
   * Overrides the "complete your profile" action for screens that can satisfy
   * it in place — Profile opens its edit modal rather than navigating to
   * itself. Everything else keeps the shared navigation behaviour.
   */
  onCompleteProfile?: () => void;
}

/**
 * Renders the guardian/permission pending banner when the current user is not
 * allowed to use the feed, and nothing otherwise.
 *
 * Every authenticated screen needs this, and each one previously inlined the
 * same `!permissions.allowed && permissions.message` guard plus an identical
 * 8-line CTA dispatch — 10 byte-identical copies, differing only in
 * `profile-page`'s one line. Screens now render this component instead, so the
 * visibility rule and the CTA routing live in one place.
 */
export const FeedPermissionBanner: React.FC<FeedPermissionBannerProps> = ({
  onNavigate,
  onCompleteProfile,
}) => {
  const { permissions } = useFeedPermissions(onNavigate);

  if (permissions.allowed || !permissions.message) return null;

  // This banner is for blocks the user can act on. The domain gives exactly the
  // three actionable reasons a CTA (UNAUTHENTICATED → Sign In,
  // PROFILE_INCOMPLETE → Complete Profile, GUARDIAN_APPROVAL_REQUIRED → Check
  // Approval) and deliberately gives SUPERVISION_CONTROL_RESTRICTED none —
  // nothing the child does will lift a parent's setting. Those are explained
  // where the blocked content would be (`PermissionCard` / `PermissionNotice`),
  // so surfacing them here too just repeated the same sentence twice on one
  // screen.
  if (!permissions.ctaAction) return null;

  return (
    <PendingBanner
      message={permissions.message}
      actionText={permissions.ctaText ?? undefined}
      onActionClick={() => {
        if (permissions.ctaAction === 'COMPLETE_PROFILE' && onCompleteProfile) {
          onCompleteProfile();
          return;
        }
        resolveFeedPermissionCta(permissions.ctaAction, onNavigate);
      }}
    />
  );
};
