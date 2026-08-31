'use client';

import { useState } from 'react';
import { Dropdown } from '@/components/common/FormControls';
import { NoDataFound } from '@/components/common/no-data-found';
import { profileDemoData } from '@/demo-data/profile';

export interface ProfileStatsTabProps {
  isOwnProfile: boolean;
  /** See `ProfileMediaTab`'s doc comment — the other-user popup's own
   * preview/demo context, never true on the real `/profile` page. */
  showDemoFallback?: boolean;
}

/** `profileDemoData.stats` is always the VIEWER's own demo stats — must
 * gate on `isOwnProfile`/`showDemoFallback` (see `ProfileMediaTab`'s
 * comment for the same fix); otherwise viewing anyone else's profile
 * showed your own stats. */
export function ProfileStatsTab({ isOwnProfile, showDemoFallback = false }: Readonly<ProfileStatsTabProps>) {
  const { filters, summary, metrics } = profileDemoData.stats;
  const [season, setSeason] = useState(filters.seasons[0]);
  const [team, setTeam] = useState(filters.teams[0]);
  const [competition, setCompetition] = useState(filters.competitionTypes[0]);

  if (!isOwnProfile && !showDemoFallback) {
    return <NoDataFound title="No Stats Yet" description="Player statistics aren't available for this profile yet." />;
  }

  return (
    <section className="rounded-lg border border-auth-stroke bg-auth-field p-4 text-foreground">
      <div className="grid grid-cols-3 gap-2 max-[520px]:grid-cols-1">
        <label className="sr-only" htmlFor="profile-season">Season</label>
        <Dropdown id="profile-season" value={season} options={filters.seasons} onChange={setSeason} variant="compact-centered" />
        <label className="sr-only" htmlFor="profile-team">Team</label>
        <Dropdown id="profile-team" value={team} options={filters.teams} onChange={setTeam} variant="compact-centered" />
        <label className="sr-only" htmlFor="profile-competition">Competition</label>
        <Dropdown id="profile-competition" value={competition} options={filters.competitionTypes} onChange={setCompetition} variant="compact-centered" />
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-auth-stroke bg-background p-4">
        <div><h2 className="text-base font-bold">{summary.title}</h2><p className="mt-1 text-xs text-muted-foreground">Season performance overview</p></div>
        <div className="flex gap-5 text-center"><div><strong className="block text-lg">{summary.gamesPlayed}</strong><span className="text-[11px] text-muted-foreground">GP</span></div><div><strong className="block text-lg text-primary">{summary.points}</strong><span className="text-[11px] text-muted-foreground">PTS</span></div></div>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 max-[520px]:grid-cols-2">
        {metrics.map((metric) => <div key={metric.label} className="rounded-lg border border-auth-stroke bg-background p-4 text-center"><dd className="text-xl font-bold">{metric.value}</dd><dt className="mt-1 text-xs text-muted-foreground">{metric.label}</dt></div>)}
      </dl>
    </section>
  );
}
