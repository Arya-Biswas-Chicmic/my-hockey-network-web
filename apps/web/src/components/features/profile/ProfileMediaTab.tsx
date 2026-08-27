'use client';

import { ImageOff } from 'lucide-react';

import { NoDataFound } from '@/components/common/no-data-found';

/** Media listing is intentionally unavailable until the backend exposes a gallery endpoint. */
export function ProfileMediaTab() {
  return (
    <div className="mhn-profile-tab-content-card-full mhn-media-card-override">
      <NoDataFound
        title="No media available"
        description="Profile media will appear here when gallery support is available."
        icon={<ImageOff size={32} strokeWidth={1.75} aria-hidden="true" />}
      />
    </div>
  );
}
