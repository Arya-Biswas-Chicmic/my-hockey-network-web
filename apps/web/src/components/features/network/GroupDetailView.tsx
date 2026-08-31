'use client';

import { useState } from 'react';
import { ChevronDown, ChevronLeft, Plus, Share2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { GroupDetailContent } from '@/components/features/groups/GroupDetailContent';
import { GroupDetailSidebar } from '@/components/features/groups/GroupDetailSidebar';
import { FallbackImage } from '@/components/ui/fallback-image';
import { getDemoGroupDetail, type GroupDetailTab } from '@/demo-data/groups';
import { cn } from '@/utils/cn';
import { showInfoToast } from '@/utils/toast';

export interface GroupDetailViewProps {
  groupId?: string;
  groupName?: string;
  memberCount?: string;
  coverImage?: string;
  onBackToGroups?: () => void;
  onEventClick?: (eventId: string) => void;
}

const tabs: readonly { id: GroupDetailTab; label: string }[] = [
  { id: 'posts', label: 'Posts' },
  { id: 'about', label: 'About' },
  { id: 'people', label: 'People' },
  { id: 'events', label: 'Events' },
  { id: 'media', label: 'Media' },
  { id: 'files', label: 'Files' },
];

export function GroupDetailView({ groupId, groupName, memberCount, coverImage, onBackToGroups, onEventClick }: Readonly<GroupDetailViewProps>) {
  const fixture = getDemoGroupDetail(groupId);
  const group = {
    ...fixture,
    name: groupName ?? fixture.name,
    memberCount: memberCount ?? fixture.memberCount,
    coverImage: coverImage ?? fixture.coverImage,
  };
  const [activeTab, setActiveTab] = useState<GroupDetailTab>('posts');
  const [isJoined, setIsJoined] = useState(true);

  return (
    <div className="mx-auto flex w-full max-w-[1166px] flex-col gap-4 pb-16 text-foreground">
      <article className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="relative aspect-[4/1] min-h-[180px] w-full overflow-hidden bg-muted">
          <FallbackImage src={group.coverImage} alt={group.name} fill priority sizes="(max-width: 1200px) 100vw, 1166px" fallbackSrc="/cover.webp" className="object-cover" />
          {onBackToGroups ? (
            <Button type="button" variant="unstyled" className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full bg-background/80 shadow-lg backdrop-blur-sm" onClick={onBackToGroups} aria-label="Back to groups">
              <ChevronLeft size={20} aria-hidden="true" />
            </Button>
          ) : null}
        </div>

        <div className="px-5 pt-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold leading-8 text-foreground">{group.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{group.memberCount}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="solid-outline" className="h-9 px-4 py-0 text-sm font-semibold" onClick={() => showInfoToast('Invite link copied to clipboard.')}><Plus size={16} aria-hidden="true" /> Invite</Button>
              <Button type="button" variant="solid-outline" className="h-9 px-4 py-0 text-sm font-semibold" onClick={() => showInfoToast('Group link copied to clipboard.')}><Share2 size={16} aria-hidden="true" /> Share</Button>
              <Button type="button" className={cn('h-9 rounded-lg px-4 text-sm font-semibold', isJoined ? 'bg-primary text-primary-foreground' : 'border border-primary bg-transparent text-primary')} onClick={() => setIsJoined((value) => !value)}>
                {isJoined ? 'Joined' : 'Join Group'} <ChevronDown size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>

          <nav className="mt-5 flex items-center gap-8 overflow-x-auto border-t border-border pt-4" aria-label="Group details">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                type="button"
                variant="unstyled"
                className={cn(
                  'relative shrink-0 pb-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground',
                  activeTab === tab.id && 'text-[var(--tab-active-text)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--tab-active-underline)]',
                )}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>
      </article>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0"><GroupDetailContent group={group} activeTab={activeTab} onEventClick={onEventClick} /></main>
        <GroupDetailSidebar group={group} />
      </div>
    </div>
  );
}
