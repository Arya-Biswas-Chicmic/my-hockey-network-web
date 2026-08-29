import React, { useState } from 'react';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';
import { FeedPostCard } from '@/components/features/home/FeedPostCard';

import { CategoryTabs, TabItem } from '@/components/features/home/HomeTabs';
import { SearchWidget } from '@/components/features/home/SearchWidget';
import { PageShell } from '@/components/layout/PageShell';

const EXPLORE_TABS: TabItem<'popular' | 'suggested' | 'verified'>[] = [
  { key: 'popular', label: 'Popular' },
  { key: 'suggested', label: 'Suggested' },
  { key: 'verified', label: 'Verified Accounts' },
];

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

interface SuggestedUser {
  id: string;
  name: string;
  avatar: string;
  isFollowing?: boolean;
}

const INITIAL_SUGGESTIONS: SuggestedUser[] = [
  { id: 's1', name: 'Connor McDavid', avatar: '/connor.webp', isFollowing: false },
  { id: 's2', name: 'Sidney Crosby', avatar: '/steve.webp', isFollowing: false },
  { id: 's3', name: 'Alex Ovechkin', avatar: '/ovechkin.webp', isFollowing: false },
  { id: 's4', name: 'Nathan MacKinnon', avatar: '/jack.webp', isFollowing: false },
  { id: 's5', name: 'Auston Matthews', avatar: '/lucas.webp', isFollowing: false },
];

export const ExplorePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeExploreTab, setActiveExploreTab] = useState<'popular' | 'suggested' | 'verified'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>(INITIAL_SUGGESTIONS);

  const toggleFollowUser = (id: string) => {
    setSuggestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFollowing: !item.isFollowing } : item))
    );
  };

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

      <PageShell className="mhn-explore-main-container grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start lg:min-h-0 lg:flex-1">
        {/* CENTER FEED COLUMN */}
        <section className="mhn-explore-center-col flex flex-col gap-5 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2 pb-16">
          {/* Search Bar Input Widget — shared `SearchWidget` (feedback
              2026-08-30: "make sure we are using same component everywhere
              for ... search bar"). */}
          <SearchWidget value={searchQuery} onChange={setSearchQuery} className="w-full flex-none" />

          {/* Sub-Navigation Categories Bar */}
          <CategoryTabs
            tabs={EXPLORE_TABS}
            activeTab={activeExploreTab}
            onChange={setActiveExploreTab}
          />

          {/* Post stack — its own `gap-2` (8px), matching the Home feed's
              post-to-post gap (the project's one reference spacing for a
              vertical card stack, feedback 2026-08-30: "spacing between two
              feed this is ideal spacing I need everywhere"), kept separate
              from the outer section's `gap-5` which spaces the search bar/
              tabs chrome above it instead. */}
          <div className="flex flex-col gap-2">
          {/* Both posts now render through the shared `FeedPostCard` —
              same component Home uses — instead of hand-rolled markup with
              no profile-click wiring of its own (feedback 2026-08-30:
              "explore should open profile like in feed... make same feed
              card used everywhere"). This also makes the caption/avatar/
              like-button alignment identical to Home by construction
              rather than needing to be kept in sync by hand. */}
          <FeedPostCard
            id="explore-demo-kc-blueknocks"
            authorId="demo-kc-blueknocks"
            authorName="KC Blueknocks"
            authorRole="Official Team"
            authorTime="1d"
            authorAvatar="/KCBluenocks.webp"
            content={'First tournament of the season! Let’s go!\n\nBig thanks to all our players, coaches, and supporters who brought incredible energy to the rink today. On to the finals! 🏒⚡'}
            postImage="/playHockey.webp"
            likesCount={13}
            commentsCount={2}
            repostCount={1}
            demoMode
          />

          <FeedPostCard
            id="explore-demo-jack-ruffle"
            authorId="demo-jack-ruffle"
            authorName="Jack Ruffle"
            authorRole="C • #97"
            authorTime="20 July"
            authorAvatar="/gerard.webp"
            content={'🏒 FINAL MATCH DAY! 🏆\n\nEverything we’ve trained for comes down to this moment. The pressure is high, the ice is ready, and we’re prepared to give it everything we’ve got.\n\nNo fear. No excuses. Just heart, teamwork, and the hunger to win. One final battle. One chance to become champions. Let’s bring the trophy home! 🔥🏆\n\n#IceHockey #FinalMatch #GameDay #Championship #LetsGo'}
            likesCount={42}
            commentsCount={8}
            repostCount={4}
            demoMode
          />
          </div>
        </section>

        {/* RIGHT SIDEBAR COLUMN: YOU MIGHT LIKE */}
        <aside className="mhn-explore-right-col flex flex-col gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto">
          <div className="mhn-you-might-like-card bg-[#0A1220] border border-[#162238] rounded-2xl p-4 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">You Might Like</h3>
              <Button
                onClick={() => onNavigate && onNavigate('network')}
                className="text-xs font-semibold text-[#168BFF] hover:underline"
              >
                View All
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {suggestions.map((person) => (
                <div key={person.id} className="flex items-center justify-between gap-3 py-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#1E2D4A]">
                      <FallbackImage
                        src={person.avatar}
                        alt={person.name}
                        fill
                        fallbackSrc="/userPlaceholder.webp"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-100 truncate">
                      {person.name}
                    </span>
                  </div>

                  <Button
                    onClick={() => toggleFollowUser(person.id)}
                    className={`shrink-0 px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      person.isFollowing
                        ? 'bg-[#15243B] text-slate-300 border border-[#1F3352]'
                        : 'bg-transparent text-[#168BFF] border border-[#168BFF] hover:bg-[#168BFF]/10'
                    }`}
                  >
                    {person.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </PageShell>
    </>
  );
};
