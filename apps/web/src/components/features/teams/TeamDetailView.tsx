'use client';

import { useState } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { WhoToFollowWidget } from '@/components/features/home/WhoToFollowWidget';
import { TeamDetailContent } from '@/components/features/teams/TeamDetailContent';
import { FallbackImage } from '@/components/ui/fallback-image';
import { profileDemoData } from '@/demo-data/profile';
import { getDemoTeamDetail, type TeamDetailTab } from '@/demo-data/teams';
import { cn } from '@/utils/cn';
import { showInfoToast } from '@/utils/toast';

export interface TeamDetailViewProps {
  teamId?: string;
  teamName?: string;
  teamLogo?: string;
  initialTab?: TeamDetailTab;
  onBackToTeams?: () => void;
  onEventClick?: (eventId: string) => void;
  onNavigate?: (screen: string) => void;
}

const tabs: readonly { id: TeamDetailTab; label: string }[] = [
  { id: 'posts', label: 'Posts' },
  { id: 'members', label: 'Members' },
  { id: 'events', label: 'Events' },
  { id: 'media', label: 'Media' },
  { id: 'about', label: 'About' },
];

/** Team Detail page — Figma nodes 1686:8399 (Posts/hero), 1696:9258
 * (Members), 1696:10222 (Events), 1884:14732 (Media), 1733:21876 (About).
 * Mirrors `GroupDetailView`'s hero-card + tab-bar + two-column layout (the
 * same shape already established for Group Detail), swapping the
 * cover-photo hero for a logo/stat-box hero and the Join/Invite/Share
 * action row for Follow/Message, per this design. The right column reuses
 * the existing `WhoToFollowWidget` from Home verbatim — the Figma sidebar
 * here is that exact widget, not a team-specific one. */
export function TeamDetailView({ teamId, teamName, teamLogo, initialTab = 'posts', onBackToTeams, onEventClick, onNavigate }: Readonly<TeamDetailViewProps>) {
  const team = getDemoTeamDetail(teamId, { name: teamName, logo: teamLogo });
  const [activeTab, setActiveTab] = useState<TeamDetailTab>(initialTab);
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-[1166px] flex-col gap-4 pb-16 text-foreground">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <article className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-start gap-3 p-5">
              {onBackToTeams ? (
                <Button type="button" variant="unstyled" className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-muted" onClick={onBackToTeams} aria-label="Back to teams">
                  <ChevronLeft size={20} aria-hidden="true" />
                </Button>
              ) : null}

              <div className="flex flex-1 flex-col gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="relative size-[102px] shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
                    <FallbackImage src={team.logo} alt={team.name} fill sizes="102px" fallbackSrc="/columbus.webp" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold leading-8 text-foreground">{team.name}</h1>
                    <p className="mt-2 text-sm font-semibold text-foreground">{team.followerCount}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{team.tagline}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <StatBox label="Leagues" value={team.stats.leagues} />
                  <StatBox label="Trophies" value={team.stats.trophies} />
                  <StatBox label="Members" value={team.stats.members} />
                </div>

                <div className="flex items-center gap-2">
                  <Button type="button" className="h-11 flex-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90" onClick={() => setIsFollowing((value) => !value)}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button type="button" variant="solid-outline" className="h-11 flex-1 border-primary py-0 text-sm font-semibold text-primary" onClick={() => showInfoToast('Messaging is not connected yet.')}>
                    Message
                  </Button>
                  <Button type="button" variant="solid-outline" className="flex h-11 w-11 shrink-0 items-center justify-center border-primary p-0 text-primary" aria-label="More team options" onClick={() => showInfoToast('More options coming soon.')}>
                    <ChevronDown size={16} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-8 overflow-x-auto border-t border-border px-5" aria-label="Team details">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  type="button"
                  variant="unstyled"
                  className={cn(
                    'relative shrink-0 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground',
                    activeTab === tab.id && 'text-[var(--tab-active-text)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--tab-active-underline)]',
                  )}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.label}
                </Button>
              ))}
            </nav>
          </article>

          <div className="mt-4">
            <TeamDetailContent team={team} activeTab={activeTab} onEventClick={onEventClick} />
          </div>
        </div>

        <aside>
          {/* Same component, same `fallbackSuggestions` convention as Home
              (`home-page.tsx`) — without it, `useFollowSuggestions` had
              nothing to fall back to whenever the real `/network`
              suggestions API returned empty, so the widget rendered with
              no rows at all (feedback 2026-08-31: "who to follow is same
              compoent than why its not showing data"). */}
          <WhoToFollowWidget fallbackSuggestions={profileDemoData.people} onViewAll={() => onNavigate?.('network')} />
        </aside>
      </div>
    </div>
  );
}

function StatBox({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-background py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
