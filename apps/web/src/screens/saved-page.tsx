import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  Heart,
  MessageCircle,
  Repeat,
  Clock,
  MapPin,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { showInfoToast } from '@/utils/toast';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

interface SavedItem {
  id: string;
  type: 'post' | 'event';
  authorName?: string;
  authorAvatar?: string;
  authorSubtitle?: string;
  title?: string;
  content?: string;
  image?: string;
  date?: string;
  location?: string;
  likesCount?: number;
  commentsCount?: number;
  repostCount?: number;
}

const INITIAL_SAVED_ITEMS: SavedItem[] = [
  {
    id: 'sav-1',
    type: 'post',
    authorName: 'KC Blueknocks',
    authorAvatar: '/KCBluenocks.webp',
    authorSubtitle: 'Official Team · 1d',
    content: "First tournament of the season! Let's go! Big thanks to all our players, coaches, and supporters who brought incredible energy to the rink today.",
    image: '/playHockey.webp',
    likesCount: 13,
    commentsCount: 2,
    repostCount: 1,
  },
  {
    id: 'sav-2',
    type: 'event',
    title: '2026 Tim Hortons NHL Heritage Classic',
    image: '/classic.webp',
    date: 'October 29, 2026',
    location: 'Princess Auto Stadium · Winnipeg',
  },
  {
    id: 'sav-3',
    type: 'post',
    authorName: 'Jack Ruffle',
    authorAvatar: '/gerard.webp',
    authorSubtitle: 'C · #97 · 20 July',
    content: '🏒 FINAL MATCH DAY! 🏆 Everything we\'ve trained for comes down to this moment. No fear. No excuses. Just heart, teamwork, and the hunger to win! #IceHockey #FinalMatch #GameDay',
    likesCount: 42,
    commentsCount: 8,
    repostCount: 4,
  },
];

export const SavedPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeNavTab, setActiveNavTab] = useState('saved');
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'events'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedItems, setSavedItems] = useState<SavedItem[]>(INITIAL_SAVED_ITEMS);

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleRemoveSaved = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
    showInfoToast('Item removed from Saved');
  };

  const postsCount = savedItems.filter((item) => item.type === 'post').length;
  const eventsCount = savedItems.filter((item) => item.type === 'event').length;

  const filteredItems = savedItems.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.authorName && item.authorName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 'posts') return matchesSearch && item.type === 'post';
    if (activeTab === 'events') return matchesSearch && item.type === 'event';
    return matchesSearch;
  });

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

      <main className="mhn-saved-main-container max-w-[1180px] w-full my-6 mx-auto px-6 flex flex-col gap-6 box-border lg:my-0 lg:min-h-0 lg:flex-1 lg:py-6 lg:overflow-y-auto pb-16">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-100">Saved</h1>

          <div className="relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved items"
              className="w-full h-10 pl-9 pr-4 bg-[#0D1627] border border-[#182740] rounded-xl text-xs text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#168BFF] transition-all"
            />
          </div>
        </div>

        {/* Navigation Tabs Bar (All, Posts, Events) */}
        <div className="flex items-center gap-8 border-b border-[#182740] pb-2">
          <Button
            onClick={() => setActiveTab('all')}
            className={`text-sm font-semibold relative pb-2 transition-colors ${
              activeTab === 'all'
                ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({savedItems.length})
          </Button>
          <Button
            onClick={() => setActiveTab('posts')}
            className={`text-sm font-semibold relative pb-2 transition-colors ${
              activeTab === 'posts'
                ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Posts ({postsCount})
          </Button>
          <Button
            onClick={() => setActiveTab('events')}
            className={`text-sm font-semibold relative pb-2 transition-colors ${
              activeTab === 'events'
                ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Events ({eventsCount})
          </Button>
        </div>

        {/* Saved Items Stream */}
        <div className="flex flex-col gap-5 max-w-[760px] mt-2">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Bookmark size={36} className="text-slate-500" />
              <h3 className="text-base font-bold text-slate-200">No Saved Items</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Items you bookmark across the network will be saved here for quick access.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <article
                key={item.id}
                className="bg-[#0A1220] border border-[#162238] rounded-2xl p-4 flex flex-col gap-3 shadow-lg transition-all hover:border-[#1F3352]"
              >
                {item.type === 'post' ? (
                  <>
                    {/* Post Author Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#1E2D4A]">
                          <FallbackImage
                            src={item.authorAvatar || '/userPlaceholder.webp'}
                            alt={item.authorName || ''}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-sm font-bold text-slate-100">{item.authorName}</h4>
                          <span className="text-xs text-slate-400">{item.authorSubtitle}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleRemoveSaved(item.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800/40"
                        title="Remove from saved"
                      >
                        <Bookmark size={18} fill="#168BFF" className="text-[#168BFF]" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <p className="text-sm text-slate-200 leading-relaxed">{item.content}</p>

                    {/* Optional Post Image */}
                    {item.image && (
                      <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 aspect-[16/9] border border-[#182740] mt-1">
                        <FallbackImage
                          src={item.image}
                          alt="Saved Post Media"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Post Actions Footer */}
                    <div className="flex items-center justify-between border-t border-[#162238] pt-3 text-slate-400 text-xs">
                      <div className="flex items-center gap-6 font-semibold">
                        <span className="flex items-center gap-1.5"><Heart size={16} /> {item.likesCount}</span>
                        <span className="flex items-center gap-1.5"><MessageCircle size={16} /> {item.commentsCount}</span>
                        <span className="flex items-center gap-1.5"><Repeat size={16} /> {item.repostCount}</span>
                      </div>

                      <span className="text-[11px] font-medium text-slate-400">Saved Post</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Event Saved Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="relative w-28 aspect-[16/9] rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-[#182740]">
                          <FallbackImage
                            src={item.image || '/classic.webp'}
                            alt={item.title || ''}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-bold text-slate-100 line-clamp-1">{item.title}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock size={13} />
                            <span>{item.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <MapPin size={13} />
                            <span>{item.location}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleRemoveSaved(item.id)}
                        className="text-[#168BFF] p-1.5 rounded-lg hover:bg-slate-800/40 shrink-0"
                        title="Remove from saved"
                      >
                        <Bookmark size={18} fill="#168BFF" />
                      </Button>
                    </div>
                  </>
                )}
              </article>
            ))
          )}
        </div>
      </main>
    </AppShell>
  );
};

