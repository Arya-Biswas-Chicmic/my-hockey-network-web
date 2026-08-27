'use client';

import { ChartNoAxesCombined } from 'lucide-react';

import { NoDataFound } from '@/components/common/no-data-found';

/** Statistics remain unavailable until a verified backend statistics endpoint exists. */
export function ProfileStatsTab() {
  return (
    <div className="mhn-profile-tab-content-card-full">
      <NoDataFound
        title="Statistics unavailable"
        description="Verified player statistics will appear here when tracking data is connected."
        icon={<ChartNoAxesCombined size={32} strokeWidth={1.75} aria-hidden="true" />}
      />
    </div>
  );
}
