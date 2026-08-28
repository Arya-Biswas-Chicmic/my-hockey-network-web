'use client';

import { ProfileCareerSection, type ProfileCareerSectionProps } from '@/components/features/profile/ProfileCareerSection';

/**
 * Profile > Career tab (Figma node 1733:22397, 2026-08-28 "new profile
 * screen" pass). `ProfileCareerSection` already renders exactly this —
 * team logo, name, role/date-range/location, note, edit/delete — it just
 * used to live nested inside the (now-retired) About tab. Promoted to its
 * own top-level tab with a thin wrapper rather than duplicating the
 * team-list markup, so the CRUD form/hook (`use-profile-career.ts`) stays
 * the single source of truth.
 */
export function ProfileCareerTab(props: Readonly<ProfileCareerSectionProps>) {
  return (
    <section className="rounded-lg border border-auth-stroke bg-auth-field p-5 text-foreground">
      <ProfileCareerSection {...props} />
    </section>
  );
}
