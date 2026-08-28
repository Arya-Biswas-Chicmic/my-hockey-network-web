import React from 'react';

/**
 * Loading placeholder for the `(public)` route group — the credential-free
 * public profile at `/players/[id]`.
 *
 * Mirrors that page's own Tailwind shell (cover band, overlapping avatar,
 * max-w-2xl column) rather than the authenticated app skeleton: this route is
 * indexable and reached by signed-out visitors and crawlers, so a sidebar/feed
 * placeholder would both mislead and shift the layout on swap.
 */
export const PublicProfileSkeletonLoader: React.FC = () => (
  <main className="min-h-screen bg-background pb-16" aria-hidden="true">
    <div className="mhn-skeleton-shimmer h-48 w-full sm:h-64" />

    <div className="mx-auto max-w-2xl px-6">
      <div className="mhn-skeleton-shimmer relative -mt-16 size-32 rounded-full border-4 border-background" />

      <div className="mhn-skeleton-shimmer mt-4 h-7 w-56 rounded-md" />
      <div className="mhn-skeleton-shimmer mt-2 h-4 w-40 rounded-md" />
      <div className="mhn-skeleton-shimmer mt-3 h-6 w-28 rounded-full" />

      <div className="mt-4 space-y-2">
        <div className="mhn-skeleton-shimmer h-4 w-full rounded-md" />
        <div className="mhn-skeleton-shimmer h-4 w-4/5 rounded-md" />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="mhn-skeleton-shimmer mx-auto h-5 w-48 rounded-md" />
        <div className="mhn-skeleton-shimmer mx-auto mt-3 h-10 w-40 rounded-lg" />
      </div>
    </div>
  </main>
);
