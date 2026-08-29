import React, { useMemo, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/common/Button';
import { FeedPostCard } from '@/components/features/home/FeedPostCard';
import { SearchWidget } from '@/components/features/home/SearchWidget';
import { PageShell } from '@/components/layout/PageShell';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { getSavedDemoFeedRecords, toFeedPostProps, type DemoFeedRecord } from '@/demo-data/feed';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

// Saved reads from the same shared feed dataset every other surface does
// (`@/demo-data/feed`) instead of its own disconnected fixture — product
// direction 2026-08-29: "out of 20 other feeds show like I have saved
// those so saved data will show those feeds only so single data base will
// be used in multiple locations." Renders through the exact same
// `FeedPostCard` component Home/Explore/Profile use (via the shared
// `toFeedPostProps` adapter) instead of a hand-rolled card with its own
// colors/sizing — feedback 2026-08-30/31: "make sure feed component looks
// exacty same and it should used everywhere." An `eventDateTag` record
// renders as a normal post with the small event-date badge on its media
// (`PostMedia`'s existing overlay), matching how Home already renders the
// same event-tagged records — not a separate one-off "event card" layout.
export const SavedPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'events'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const viewer = useMemo(
    () => ({
      name: user?.profile?.displayName || undefined,
      avatar: user?.profile?.avatarUrl ? resolveMediaUrl(user.profile.avatarUrl) : undefined,
      role: user?.profile?.roleTag || user?.primaryRole || undefined,
    }),
    [user],
  );

  const savedRecords = useMemo(
    () => getSavedDemoFeedRecords().filter((record) => !removedIds.has(record.id)),
    [removedIds],
  );

  const handleRemoveSaved = (id: string) => {
    setRemovedIds((prev) => new Set(prev).add(id));
  };

  const postsCount = savedRecords.filter((record) => !record.eventDateTag).length;
  const eventsCount = savedRecords.filter((record) => record.eventDateTag).length;

  const filteredRecords = savedRecords.filter((record) => {
    const matchesSearch =
      !searchQuery.trim() ||
      `${record.authorName} ${record.content}`.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'posts') return matchesSearch && !record.eventDateTag;
    if (activeTab === 'events') return matchesSearch && Boolean(record.eventDateTag);
    return matchesSearch;
  });

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

      <PageShell className="mhn-saved-main-container flex flex-col gap-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto pb-16">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-100">Saved</h1>

          {/* Shared `SearchWidget` (feedback 2026-08-30: "make sure we are
              using same component everywhere for ... search bar"). */}
          <SearchWidget value={searchQuery} onChange={setSearchQuery} placeholder="Search saved items" className="w-64 flex-none" />
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
            All ({savedRecords.length})
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

        {/* Saved Items Stream — `gap-2` (8px), matching the Home feed's own
            post-to-post gap, the project's one reference spacing for a
            vertical card stack (feedback 2026-08-30: "spacing between two
            feed this is ideal spacing I need everywhere"). */}
        <div className="flex flex-col gap-2 max-w-[760px] mt-2">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Bookmark size={36} className="text-slate-500" />
              <h3 className="text-base font-bold text-slate-200">No Saved Items</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Items you bookmark across the network will be saved here for quick access.
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <FeedPostCard
                key={record.id}
                {...toFeedPostProps(record, viewer)}
                onNavigate={onNavigate}
                onDeleteSuccess={handleRemoveSaved}
              />
            ))
          )}
        </div>
      </PageShell>
    </>
  );
};

