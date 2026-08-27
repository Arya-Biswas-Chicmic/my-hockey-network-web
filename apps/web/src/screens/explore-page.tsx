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
import { AppShell } from '@/components/layout/AppShell';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';

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
  { id: 's1', name: 'Connor McDavid', avatar: '/connor.png', isFollowing: false },
  { id: 's2', name: 'Sidney Crosby', avatar: '/steve.png', isFollowing: false },
  { id: 's3', name: 'Alex Ovechkin', avatar: '/ovechkin.png', isFollowing: false },
  { id: 's4', name: 'Nathan MacKinnon', avatar: '/jack.png', isFollowing: false },
  { id: 's5', name: 'Auston Matthews', avatar: '/lucas.png', isFollowing: false },
];

export const ExplorePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeNavTab, setActiveNavTab] = useState('explore');
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

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const toggleFollowUser = (id: string) => {
    setSuggestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFollowing: !item.isFollowing } : item))
    );
  };

  return (
    <AppShell activeTab={activeNavTab} onTabChange={handleTabChange} onLogout={onLogout}>
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

      <main className="mhn-explore-main-container max-w-[1180px] w-full my-6 mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start box-border lg:my-0 lg:min-h-0 lg:flex-1 lg:py-6">
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
          <div className="mhn-explore-tabs-bar flex items-center gap-8 border-b border-[#182740] pb-2">
            <button
              onClick={() => setActiveExploreTab('popular')}
              className={`text-sm font-semibold relative pb-2 transition-colors ${
                activeExploreTab === 'popular'
                  ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setActiveExploreTab('suggested')}
              className={`text-sm font-semibold relative pb-2 transition-colors ${
                activeExploreTab === 'suggested'
                  ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Suggested
            </button>
            <button
              onClick={() => setActiveExploreTab('verified')}
              className={`text-sm font-semibold relative pb-2 transition-colors ${
                activeExploreTab === 'verified'
                  ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Verified Accounts
            </button>
          </div>

          {/* POST 1: KC Blueknocks */}
          <article className="mhn-explore-post-card bg-[#0A1220] border border-[#162238] rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
            {/* Post Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#1E2D4A]">
                  <FallbackImage
                    src="/KCBluenocks.png"
                    alt="KC Blueknocks"
                    fill
                    fallbackSrc="/hockeyClub.png"
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
                  className={`px-3.5 py-1 text-xs font-semibold rounded-xl transition-all ${
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
              <span>First tournament of the season! Let's go!</span>
              {!post1Expanded ? (
                <button
                  onClick={() => setPost1Expanded(true)}
                  className="text-slate-400 hover:text-slate-200 text-xs ml-1 font-medium"
                >
                  ... more
                </button>
              ) : (
                <span className="block mt-1 text-slate-300">
                  Big thanks to all our players, coaches, and supporters who brought incredible energy to the rink today. On to the finals! 🏒⚡
                </span>
              )}
            </div>

            {/* Post Image Container */}
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 aspect-[16/9] border border-[#182740]">
              <FallbackImage
                src="/playHockey.png"
                alt="KC Blueknocks Match"
                fill
                fallbackSrc="/event1.png"
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
                <button
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
                </button>

                <button className="flex items-center gap-2 text-xs font-semibold hover:text-slate-200 transition-colors">
                  <MessageCircle size={18} />
                  <span>2</span>
                </button>

                <button className="flex items-center gap-2 text-xs font-semibold hover:text-slate-200 transition-colors">
                  <Repeat size={18} />
                  <span>1</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button className="text-slate-400 hover:text-slate-200 transition-colors">
                  <Send size={18} />
                </button>
                <button
                  onClick={() => setPost1Bookmarked(!post1Bookmarked)}
                  className={`transition-colors ${
                    post1Bookmarked ? 'text-[#168BFF]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark size={18} fill={post1Bookmarked ? 'currentColor' : 'none'} />
                </button>
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
                    src="/gerard.png"
                    alt="Jack Ruffle"
                    fill
                    fallbackSrc="/userPlaceholder.png"
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
                Everything we've trained for comes down to this moment. The pressure is high, the ice is ready, and we're prepared to give it everything we've got.
              </p>
              <p>
                No fear. No excuses. Just heart, teamwork, and the hunger to win. One final battle. One chance to become champions. Let's bring the trophy home! 🔥🏆
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
                <button
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
                </button>

                <button className="flex items-center gap-2 text-xs font-semibold hover:text-slate-200 transition-colors">
                  <MessageCircle size={18} />
                  <span>8</span>
                </button>

                <button className="flex items-center gap-2 text-xs font-semibold hover:text-slate-200 transition-colors">
                  <Repeat size={18} />
                  <span>4</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button className="text-slate-400 hover:text-slate-200 transition-colors">
                  <Send size={18} />
                </button>
                <button
                  onClick={() => setPost2Bookmarked(!post2Bookmarked)}
                  className={`transition-colors ${
                    post2Bookmarked ? 'text-[#168BFF]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark size={18} fill={post2Bookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </article>
        </section>

        {/* RIGHT SIDEBAR COLUMN: YOU MIGHT LIKE */}
        <aside className="mhn-explore-right-col flex flex-col gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto">
          <div className="mhn-you-might-like-card bg-[#0A1220] border border-[#162238] rounded-2xl p-4 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">You Might Like</h3>
              <button
                onClick={() => onNavigate && onNavigate('network')}
                className="text-xs font-semibold text-[#168BFF] hover:underline"
              >
                View All
              </button>
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
                        fallbackSrc="/userPlaceholder.png"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-100 truncate">
                      {person.name}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleFollowUser(person.id)}
                    className={`shrink-0 px-3.5 py-1 text-xs font-semibold rounded-xl transition-all ${
                      person.isFollowing
                        ? 'bg-[#15243B] text-slate-300 border border-[#1F3352]'
                        : 'bg-transparent text-[#168BFF] border border-[#168BFF] hover:bg-[#168BFF]/10'
                    }`}
                  >
                    {person.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </AppShell>
  );
};

