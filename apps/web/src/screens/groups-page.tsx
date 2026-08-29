import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';
import { GroupDetailView } from '@/components/features/network/GroupDetailView';
import { SearchWidget } from '@/components/features/home/SearchWidget';
import { PageShell } from '@/components/layout/PageShell';
import { discoverDemoGroups, yourDemoGroups } from '@/demo-data/groups';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const GroupsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeTab, setActiveTab] = useState<'your-groups' | 'discover'>('your-groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const groupList = activeTab === 'your-groups' ? yourDemoGroups : discoverDemoGroups;

  const filteredGroups = groupList.filter((group) =>
    !searchQuery.trim() || group.name.toLowerCase().includes(searchQuery.toLowerCase())
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

      {selectedGroupId ? (
        <PageShell className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto pb-16">
          <GroupDetailView
            groupId={selectedGroupId}
            onBackToGroups={() => setSelectedGroupId(null)}
            onEventClick={() => onNavigate?.('event-detail')}
          />
        </PageShell>
      ) : (
        <PageShell className="mhn-groups-main-container flex flex-col gap-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto pb-16">
          {/* Top Header Row with Title and Search Input */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-100">Groups</h1>

            {/* Shared `SearchWidget`, not a hand-rolled box (feedback
                2026-08-30: "make sure we are using same component
                everywhere for ... search bar"). */}
            <SearchWidget value={searchQuery} onChange={setSearchQuery} className="w-64 flex-none" />
          </div>

          {/* Navigation Tabs Bar (Your Groups vs Discover) */}
          <div className="flex items-center gap-8 border-b border-[#182740] pb-2">
            <Button
              onClick={() => setActiveTab('your-groups')}
              className={`text-sm font-semibold relative pb-2 transition-colors ${
                activeTab === 'your-groups'
                  ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Your Groups
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

          {/* Group Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-2">
            {filteredGroups.map((group) => (
              <article
                key={group.id}
                className="mhn-group-card bg-[#0A1220] border border-[#162238] rounded-2xl overflow-hidden flex flex-col shadow-lg transition-all hover:border-[#1F3352]"
              >
                {/* Cover Image Header */}
                <div
                  className="relative w-full aspect-[16/9] bg-slate-900 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <FallbackImage
                    src={group.coverImage}
                    alt={group.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 260px"
                    fallbackSrc="/cover.webp"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {/* Top-Right Menu Options Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-slate-200 flex items-center justify-center hover:bg-black/70 transition-colors"
                    aria-label="Group Options"
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-1 gap-1">
                  <h3
                    className="text-sm font-bold text-slate-100 cursor-pointer hover:text-[#168BFF] transition-colors line-clamp-1"
                    onClick={() => setSelectedGroupId(group.id)}
                  >
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">{group.memberCount}</p>

                  <div className="mt-auto">
                    <Button
                      onClick={() => setSelectedGroupId(group.id)}
                      className="w-full h-9 rounded-xl text-xs font-semibold bg-[#0A1220] text-[#168BFF] border border-[#168BFF] hover:bg-[#168BFF]/10 transition-all flex items-center justify-center"
                    >
                      {activeTab === 'your-groups' ? 'View Group' : 'Join Group'}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </PageShell>
      )}
    </>
  );
};
