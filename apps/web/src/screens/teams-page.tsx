import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { showSuccessToast } from '@/utils/toast';
import { SearchWidget } from '@/components/features/home/SearchWidget';
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
}

const YOUR_TEAMS: TeamItem[] = [
  {
    id: 'team-1',
    name: 'Columbus Blue Jackets',
    logo: '/columbus.webp',
    league: 'NHL',
    isMember: true,
  },
  {
    id: 'team-2',
    name: 'Florida Panthers',
    logo: '/kcBlue.webp',
    league: 'NHL',
    isMember: true,
  },
  {
    id: 'team-3',
    name: 'Boston Bruins',
    logo: '/HC.webp',
    league: 'NHL',
    isMember: true,
  },
  {
    id: 'team-4',
    name: 'Toronto Maple Leafs',
    logo: '/HockeyClub2.webp',
    league: 'NHL',
    isMember: true,
  },
];

const DISCOVER_TEAMS: TeamItem[] = [
  {
    id: 'team-5',
    name: 'Chicago Blackhawks',
    logo: '/classic.webp',
    league: 'NHL',
    isMember: false,
  },
  {
    id: 'team-6',
    name: 'New York Rangers',
    logo: '/event3.webp',
    league: 'NHL',
    isMember: false,
  },
  {
    id: 'team-7',
    name: 'Edmonton Oilers',
    logo: '/event6.webp',
    league: 'NHL',
    isMember: false,
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

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;

    const newTeam: TeamItem = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      logo: '/columbus.webp',
      league: 'Custom League',
      isMember: true,
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

        {/* Team Items List */}
        <div className="flex flex-col gap-2 mt-2 max-w-[580px]">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-4 py-3.5 border-b border-[#162238]/60 last:border-none transition-colors"
            >
              {/* Team Crest Logo */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-900 border border-[#1E2D4A]">
                <FallbackImage
                  src={team.logo}
                  alt={team.name}
                  fill
                  fallbackSrc="/columbus.webp"
                  className="object-cover"
                />
              </div>

              {/* Team Details & Sub-links */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-100 truncate">
                  {team.name}
                </h3>

                {/* Sub-links row: Posts · Staff · Roster */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Button className="hover:text-slate-200 transition-colors font-medium">
                    Posts
                  </Button>
                  <span>·</span>
                  <Button className="hover:text-slate-200 transition-colors font-medium">
                    Staff
                  </Button>
                  <span>·</span>
                  <Button className="hover:text-slate-200 transition-colors font-medium">
                    Roster
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageShell>

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

