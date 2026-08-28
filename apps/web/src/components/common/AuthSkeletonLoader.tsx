import React from 'react';

/**
 * Loading placeholder for the `(auth)` route group (onboarding, guardian, sent).
 *
 * Rendered through the same real `.onboarding-screen`/`.onboarding-modal`
 * classes as the actual auth shell, so it occupies the same centered box and
 * swaps out without a layout shift. Deliberately *not* the authenticated app
 * skeleton: these routes are reached signed-out, and showing a sidebar and feed
 * placeholder there implied a logged-in app the visitor does not have, then
 * jumped to a centered single-column form once the real page mounted.
 */
export const AuthSkeletonLoader: React.FC = () => (
  <main className="onboarding-screen" aria-hidden="true">
    <div className="onboarding-modal mhn-auth-skeleton">
      <div className="mhn-auth-skeleton-art mhn-skeleton-shimmer" />

      <div className="mhn-auth-skeleton-form">
        <div className="mhn-auth-skeleton-title mhn-skeleton-shimmer" />
        <div className="mhn-auth-skeleton-subtitle mhn-skeleton-shimmer" />

        <div className="mhn-auth-skeleton-field mhn-skeleton-shimmer" />
        <div className="mhn-auth-skeleton-field mhn-skeleton-shimmer" />
        <div className="mhn-auth-skeleton-button mhn-skeleton-shimmer" />
      </div>
    </div>
  </main>
);
