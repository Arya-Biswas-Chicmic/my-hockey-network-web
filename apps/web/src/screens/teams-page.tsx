import React, { useState } from 'react';
import { MoreHorizontal, Plus, X } from 'lucide-react';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { showSuccessToast } from '@/utils/toast';
import { SearchWidget } from '@/components/features/home/SearchWidget';
import { TeamDetailView } from '@/components/features/teams/TeamDetailView';
import type { TeamDetailTab } from '@/demo-data/teams';
import { PageShell } from '@/components/layout/PageShell';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

interface TeamItem {
  id: string;
  name: string;
  logo: string;
  league?: string;
  isMember?: boolean;
  memberCount: string;
  memberAvatars: string[];
}

const YOUR_TEAMS: TeamItem[] = [
  {
    id: 'team-1',
    name: 'Columbus Blue Jackets',
    logo: '/columbus.webp',
    league: 'NHL',
    isMember: true,
    memberCount: '183 Members',
    memberAvatars: ['/connor.webp', '/lucas.webp', '/jack.webp'],
  },
  {
    id: 'team-2',
    name: 'Florida Panthers',
    logo: '/kcBlue.webp',
    league: 'NHL',
    isMember: true,
    memberCount: '96 Members',
    memberAvatars: ['/gerard.webp', '/steve.webp', '/saylor.webp'],
  },
  {
    id: 'team-3',
    name: 'Boston Bruins',
    logo: '/HC.webp',
    league: 'NHL',
    isMember: true,
    memberCount: '210 Members',
    memberAvatars: ['/david.webp', '/ovechkin.webp', '/mai.webp'],
  },
  {
    id: 'team-4',
    name: 'Toronto Maple Leafs',
    logo: '/HockeyClub2.webp',
    league: 'NHL',
    isMember: true,
    memberCount: '142 Members',
    memberAvatars: ['/connor.webp', '/jack.webp', '/steve.webp'],
  },
];

const DISCOVER_TEAMS: TeamItem[] = [
  {
    id: 'team-5',
    name: 'Chicago Blackhawks',
    logo: '/classic.webp',
    league: 'NHL',
    isMember: false,
    memberCount: '312 Members',
    memberAvatars: ['/lucas.webp', '/gerard.webp', '/david.webp'],
  },
  {
    id: 'team-6',
    name: 'New York Rangers',
    logo: '/event3.webp',
    league: 'NHL',
    isMember: false,
    memberCount: '183 Members',
    memberAvatars: ['/connor.webp', '/ovechkin.webp', '/saylor.webp'],
  },
  {
    id: 'team-7',
    name: 'Edmonton Oilers',
    logo: '/event6.webp',
    league: 'NHL',
    isMember: false,
    memberCount: '128 Members',
    memberAvatars: ['/jack.webp', '/mai.webp', '/steve.webp'],
  },
];

export const TeamsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeTab, setActiveTab] = useState<'your-teams' | 'discover'>('your-teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState<TeamItem[]>(YOUR_TEAMS);
  const [discoverTeams] = useState<TeamItem[]>(DISCOVER_TEAMS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string; logo: string; tab: TeamDetailTab } | null>(null);

  const openTeamDetail = (team: TeamItem, tab: TeamDetailTab = 'posts') => {
    setSelectedTeam({ id: team.id, name: team.name, logo: team.logo, tab });
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;

    const newTeam: TeamItem = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      logo: '/columbus.webp',
      league: 'Custom League',
      isMember: true,
      memberCount: '1 Member',
      memberAvatars: [],
    };

    setTeams([newTeam, ...teams]);
    showSuccessToast(`Team "${newTeamName.trim()}" created successfully!`);
    setNewTeamName('');
    setIsCreateModalOpen(false);
  };

  const currentList = activeTab === 'your-teams' ? teams : discoverTeams;

  const filteredTeams = currentList.filter((t) =>
    !searchQuery.trim() || t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {!permissions.allowed && permissions.message && (
        <PendingBanner
          message={permissions.message}
          actionText={permissions.ctaText || 'Complete Profile'}
          onActionClick={() => {
            if (permissions.ctaAction === 'COMPLETE_PROFILE') {
              if (onNavigate) onNavigate('profile');
            } else if (permissions.ctaAction === 'GUARDIAN_APPROVAL') {
              if (onNavigate) onNavigate('supervision');
            } else if (permissions.ctaAction === 'LOGIN') {
              if (onNavigate) onNavigate('login');
            }
          }}
        />
      )}

      {selectedTeam ? (
        <PageShell className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto pb-16">
          <TeamDetailView
            key={selectedTeam.id}
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
            teamLogo={selectedTeam.logo}
            initialTab={selectedTeam.tab}
            onBackToTeams={() => setSelectedTeam(null)}
            onEventClick={() => onNavigate?.('event-detail')}
            onNavigate={onNavigate}
          />
        </PageShell>
      ) : (
      <PageShell className="mhn-teams-main-container flex flex-col gap-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto pb-16">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-100">Teams</h1>

          <div className="flex items-center gap-3">
            {/* Search Box — shared `SearchWidget` (feedback 2026-08-30:
                "make sure we are using same component everywhere for ...
                search bar"). */}
            <SearchWidget value={searchQuery} onChange={setSearchQuery} className="w-64 flex-none" />

            {/* + Create Team Button */}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-10 px-4 bg-[#168BFF] hover:bg-[#147CE6] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-[#168BFF]/20 transition-all shrink-0"
            >
              <Plus size={16} />
              <span>Create Team</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs Bar (Your Teams vs Discover) */}
        <div className="flex items-center gap-8 border-b border-[#182740] pb-2">
          <Button
            onClick={() => setActiveTab('your-teams')}
            className={`text-sm font-semibold relative pb-2 transition-colors ${
              activeTab === 'your-teams'
                ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Your Teams
          </Button>
          <Button
            onClick={() => setActiveTab('discover')}
            className={`text-sm font-semibold relative pb-2 transition-colors ${
              activeTab === 'discover'
                ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Discover
          </Button>
        </div>

        {/* Team Cards Grid — matches the Groups/Events card-grid pattern
            (feedback 2026-08-31: "Make sure team list will be similar to
            card view like we have in groups or events not make list...
            its not in figma we need to invoate this"). No Figma reference
            exists for this specific list view, so the card itself is
            invented: a banner + centered crest (teams have circular
            crests, not rectangular cover photos, so a plain photo header
            like Groups' doesn't fit), name, member count, a small
            overlapping preview of a few roster avatars, and a
            View/Join action — the same information density as a Group
            card (name + member count + join affordance) plus a members
            preview. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-2">
          {filteredTeams.map((team) => (
            <article
              key={team.id}
              className="mhn-team-card bg-[#0A1220] border border-[#162238] rounded-2xl overflow-hidden flex flex-col shadow-lg transition-all hover:border-[#1F3352]"
            >
              {/* Banner + centered crest */}
              <div
                className="relative w-full pt-8 pb-10 flex items-center justify-center bg-gradient-to-b from-[#101B30] to-[#0A1220] cursor-pointer"
                onClick={() => openTeamDetail(team, 'posts')}
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-slate-900 border-2 border-[#1E2D4A] shadow-lg">
                  <FallbackImage
                    src={team.logo}
                    alt={team.name}
                    fill
                    sizes="64px"
                    fallbackSrc="/columbus.webp"
                    className="object-cover"
                  />
                </div>

                <Button
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-slate-200 flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label={`${team.name} options`}
                >
                  <MoreHorizontal size={16} />
                </Button>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col flex-1 gap-1 items-center text-center">
                <Button
                  type="button"
                  variant="unstyled"
                  className="hover:text-[#168BFF] transition-colors"
                  onClick={() => openTeamDetail(team, 'posts')}
                >
                  <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{team.name}</h3>
                </Button>
                <p className="text-xs text-slate-400">{team.memberCount}</p>

                {/* Members preview — overlapping avatar stack, opens
                    straight to the Members tab. */}
                {team.memberAvatars.length > 0 && (
                  <Button
                    type="button"
                    variant="unstyled"
                    className="mt-2 flex items-center -space-x-2"
                    onClick={() => openTeamDetail(team, 'members')}
                    aria-label={`View ${team.name} members`}
                  >
                    {team.memberAvatars.map((avatar, index) => (
                      <div
                        key={avatar + index}
                        className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-[#0A1220] bg-slate-900"
                      >
                        <FallbackImage src={avatar} alt="" fill sizes="24px" className="object-cover" />
                      </div>
                    ))}
                  </Button>
                )}

                <div className="mt-auto pt-3 w-full">
                  <Button
                    onClick={() => openTeamDetail(team, 'posts')}
                    className="w-full h-9 rounded-xl text-xs font-semibold bg-[#0A1220] text-[#168BFF] border border-[#168BFF] hover:bg-[#168BFF]/10 transition-all flex items-center justify-center"
                  >
                    {team.isMember ? 'View Team' : 'Join Team'}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PageShell>
      )}

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0A1220] border border-[#162238] rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#182740] pb-3">
              <h3 className="text-lg font-bold text-slate-100">Create New Team</h3>
              <Button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Plain div wrapper (not a semantic form element) — mirrors the
                other modal inputs in this codebase (QuoteRepostModal,
                PostEditModal), which submit via a button click. */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Team Name</label>
                <Input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTeam();
                  }}
                  placeholder="e.g. Columbus Blue Jackets"
                  className="w-full h-10 px-3.5 bg-[#0D1627] border border-[#182740] rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-[#168BFF]"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim()}
                  className="px-5 py-2 bg-[#168BFF] hover:bg-[#147CE6] text-white text-xs font-semibold rounded-xl shadow-md disabled:opacity-50"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

