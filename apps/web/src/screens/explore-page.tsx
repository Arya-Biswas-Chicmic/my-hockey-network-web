import React, { useState } from 'react';
import {
  Search,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Repeat,
  Send,
  Bookmark,
} from 'lucide-react';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';

import { CategoryTabs, TabItem } from '@/components/features/home/HomeTabs';
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

  // Post 1 state (KC Blueknocks)
  const [isFollowingKc, setIsFollowingKc] = useState(false);
  const [post1Liked, setPost1Liked] = useState(false);
  const [post1Likes, setPost1Likes] = useState(13);
  const [post1Bookmarked, setPost1Bookmarked] = useState(false);
  const [post1Expanded, setPost1Expanded] = useState(false);

  // Post 2 state (Jack Ruffle)
  const [post2Liked, setPost2Liked] = useState(false);
  const [post2Likes, setPost2Likes] = useState(42);
  const [post2Bookmarked, setPost2Bookmarked] = useState(false);

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
          {/* Search Bar Input Widget */}
          <div className="mhn-explore-search-wrapper relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-11 pl-11 pr-4 bg-[#0D1627] border border-[#182740] rounded-xl text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#168BFF] transition-all"
            />
          </div>

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
          {/* POST 1: KC Blueknocks */}
          <article className="mhn-explore-post-card bg-[#0A1220] border border-[#162238] rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
            {/* Post Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#1E2D4A]">
                  <FallbackImage
                    src="/KCBluenocks.webp"
                    alt="KC Blueknocks"
                    fill
                    fallbackSrc="/hockeyClub.webp"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-100">KC Blueknocks</h4>
                  </div>
                  <span className="text-xs text-slate-400">Official Team · 1d</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsFollowingKc(!isFollowingKc)}
                  className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isFollowingKc
                      ? 'bg-[#15243B] text-slate-200 border border-[#1F3352]'
                      : 'bg-transparent text-[#168BFF] border border-[#168BFF] hover:bg-[#168BFF]/10'
                  }`}
                >
                  {isFollowingKc ? 'Following' : 'Follow'}
                </Button>
                <Button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-[#15243B] transition-colors">
                  <MoreHorizontal size={18} />
                </Button>
              </div>
            </div>

            {/* Post Content text */}
            <div className="text-sm text-slate-200 leading-relaxed">
              <span>First tournament of the season! Let&apos;s go!</span>
              {!post1Expanded ? (
                <Button
                  onClick={() => setPost1Expanded(true)}
                  className="text-slate-400 hover:text-slate-200 text-xs ml-1 font-medium"
                >
                  ... more
                </Button>
              ) : (
                <span className="block mt-1 text-slate-300">
                  Big thanks to all our players, coaches, and supporters who brought incredible energy to the rink today. On to the finals! 🏒⚡
                </span>
              )}
            </div>

            {/* Post Image Container */}
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 aspect-[16/9] border border-[#182740]">
              <FallbackImage
                src="/playHockey.webp"
                alt="KC Blueknocks Match"
                fill
                fallbackSrc="/event1.webp"
                className="object-cover"
              />
              {/* Carousel Indicator Badge 1/3 */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-0.5 rounded-full border border-white/10">
                1/3
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex items-center justify-center gap-1.5 my-1">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            </div>

            {/* Post Action Footer */}
            <div className="flex items-center justify-between border-t border-[#162238] pt-3 text-slate-400">
              <div className="flex items-center gap-6">
                <Button
                  onClick={() => {
                    setPost1Liked(!post1Liked);
                    setPost1Likes((prev) => (post1Liked ? prev - 1 : prev + 1));
                  }}
                  className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                    post1Liked ? 'text-red-500' : 'hover:text-slate-200'
                  }`}
                >
                  <Heart size={18} fill={post1Liked ? 'currentColor' : 'none'} />
                  <span>{post1Likes}</span>
                </Button>

                <Button className="flex items-center gap-2 text-xs font-semibold hover:text-slate-200 transition-colors">
                  <MessageCircle size={18} />
                  <span>2</span>
                </Button>

                <Button className="flex items-center gap-2 text-xs font-semibold hover:text-slate-200 transition-colors">
                  <Repeat size={18} />
                  <span>1</span>
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button className="text-slate-400 hover:text-slate-200 transition-colors">
                  <Send size={18} />
                </Button>
                <Button
                  onClick={() => setPost1Bookmarked(!post1Bookmarked)}
                  className={`transition-colors ${
                    post1Bookmarked ? 'text-[#168BFF]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark size={18} fill={post1Bookmarked ? 'currentColor' : 'none'} />
                </Button>
              </div>
            </div>
          </article>

          {/* POST 2: Jack Ruffle */}
          <article className="mhn-explore-post-card bg-[#0A1220] border border-[#162238] rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
            {/* Post Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#1E2D4A]">
                  <FallbackImage
                    src="/gerard.webp"
                    alt="Jack Ruffle"
                    fill
                    fallbackSrc="/userPlaceholder.webp"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-100">Jack Ruffle</h4>
                  </div>
                  <span className="text-xs text-slate-400">C · #97 · 20 July</span>
                </div>
              </div>

              <Button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-[#15243B] transition-colors">
                <MoreHorizontal size={18} />
              </Button>
            </div>

            {/* Post Content text */}
            <div className="text-sm text-slate-200 leading-relaxed flex flex-col gap-2">
              <p className="font-semibold">🏒 FINAL MATCH DAY! 🏆</p>
              <p>
                Everything we&apos;ve trained for comes down to this moment. The pressure is high, the ice is ready, and we&apos;re prepared to give it everything we&apos;ve got.
              </p>
              <p>
                No fear. No excuses. Just heart, teamwork, and the hunger to win. One final battle. One chance to become champions. Let&apos;s bring the trophy home! 🔥🏆
              </p>
              <div className="flex flex-wrap gap-1.5 text-[#168BFF] font-medium text-xs mt-1">
                <span>#IceHockey</span>
                <span>#FinalMatch</span>
                <span>#GameDay</span>
                <span>#Championship</span>
                <span>#LetsGo</span>
              </div>
            </div>

            {/* Post Action Footer */}
            <div className="flex items-center justify-between border-t border-[#162238] pt-3 text-slate-400">
              <div className="flex items-center gap-6">
                <Button
                  onClick={() => {
                    setPost2Liked(!post2Liked);
                    setPost2Likes((prev) => (post2Liked ? prev - 1 : prev + 1));
                  }}
                  className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                    post2Liked ? 'text-red-500' : 'hover:text-slate-200'
                  }`}
                >
                  <Heart size={18} fill={post2Liked ? 'currentColor' : 'none'} />
                  <span>{post2Likes}</span>
                </Button>

                <Button className="flex items-center gap-2 text-xs font-semibold hover:text-slate-200 transition-colors">
                  <MessageCircle size={18} />
                  <span>8</span>
                </Button>

                <Button className="flex items-center gap-2 text-xs font-semibold hover:text-slate-200 transition-colors">
                  <Repeat size={18} />
                  <span>4</span>
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button className="text-slate-400 hover:text-slate-200 transition-colors">
                  <Send size={18} />
                </Button>
                <Button
                  onClick={() => setPost2Bookmarked(!post2Bookmarked)}
                  className={`transition-colors ${
                    post2Bookmarked ? 'text-[#168BFF]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark size={18} fill={post2Bookmarked ? 'currentColor' : 'none'} />
                </Button>
              </div>
            </div>
          </article>
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
