'use client';

import { Select } from '@/components/common/FormControls';
import { NoDataFound } from '@/components/common/no-data-found';
import { profileDemoData } from '@/demo-data/profile';

export interface ProfileStatsTabProps {
  isOwnProfile: boolean;
}

/** `profileDemoData.stats` is always the VIEWER's own demo stats — must
 * gate on `isOwnProfile` (see `ProfileMediaTab`'s comment for the same
 * fix); otherwise viewing anyone else's profile showed your own stats. */
export function ProfileStatsTab({ isOwnProfile }: Readonly<ProfileStatsTabProps>) {
  if (!isOwnProfile) {
    return <NoDataFound title="No Stats Yet" description="Player statistics aren't available for this profile yet." />;
  }

  const { filters, summary, metrics } = profileDemoData.stats;
  return (
    <section className="rounded-lg border border-auth-stroke bg-auth-field p-4 text-foreground">
      <div className="grid grid-cols-3 gap-2 max-[520px]:grid-cols-1">
        <label className="sr-only" htmlFor="profile-season">Season</label>
        <Select id="profile-season" defaultValue={filters.seasons[0]} className="h-9 rounded-lg border border-auth-stroke bg-background px-3 text-xs text-foreground">{filters.seasons.map((value) => <option key={value}>{value}</option>)}</Select>
        <label className="sr-only" htmlFor="profile-team">Team</label>
        <Select id="profile-team" defaultValue={filters.teams[0]} className="h-9 rounded-lg border border-auth-stroke bg-background px-3 text-xs text-foreground">{filters.teams.map((value) => <option key={value}>{value}</option>)}</Select>
        <label className="sr-only" htmlFor="profile-competition">Competition</label>
        <Select id="profile-competition" defaultValue={filters.competitionTypes[0]} className="h-9 rounded-lg border border-auth-stroke bg-background px-3 text-xs text-foreground">{filters.competitionTypes.map((value) => <option key={value}>{value}</option>)}</Select>
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
