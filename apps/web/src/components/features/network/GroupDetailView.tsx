import React, { useState } from 'react';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import {
  Search,
  ChevronDown,
  Grid,
  List,
  Plus,
  Share2,
  MoreHorizontal,
  Star,
  Calendar,
  MapPin,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import { showInfoToast, showSuccessToast } from '@/utils/toast';

export interface GroupDetailViewProps {
  groupId?: string;
  groupName?: string;
  memberCount?: string;
  coverImage?: string;
  onBackToGroups?: () => void;
}

export function GroupDetailView({
  groupName = 'San Jose Sharks',
  memberCount = '54.7k Members',
  coverImage = '/cover.webp',
  onBackToGroups,
}: GroupDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'people' | 'events' | 'media' | 'files'>('events');
  const [isJoined, setIsJoined] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const GROUP_EVENTS = [
    {
      id: 'gev-1',
      title: '2026 Tim Hortons NHL Heritage Classic',
      image: '/classic.webp',
      date: 'October 25, 2026',
      location: 'Princess Auto Stadium – Winnipeg',
      interestedCount: '1.9k',
      goingCount: '37',
      isInterested: true,
      buttonType: 'interested' as const,
    },
    {
      id: 'gev-2',
      title: '2026 Tim Hortons NHL Heritage Classic',
      image: '/event1.webp',
      date: 'October 25, 2026',
      location: 'Princess Auto Stadium – Winnipeg',
      interestedCount: '1.9k',
      goingCount: '37',
      isInterested: false,
      buttonType: 'interested' as const,
    },
    {
      id: 'gev-3',
      title: '2026 Tim Hortons NHL Heritage Classic',
      image: '/event2.webp',
      date: 'October 25, 2026',
      location: 'Princess Auto Stadium – Winnipeg',
      interestedCount: '1.9k',
      goingCount: '37',
      isInterested: false,
      buttonType: 'share' as const,
    },
  ];

  return (
    <div className="mhn-group-detail-view max-w-[1240px] w-full mx-auto flex flex-col gap-6 pb-16">
      {/* Back to Groups Link */}
      <Button
        onClick={onBackToGroups}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        <span>Back to Groups</span>
      </Button>

      {/* Main Group Hero Header */}
      <div className="mhn-group-hero-card bg-[#0A1220] border border-[#162238] rounded-2xl overflow-hidden shadow-xl">
        {/* Cover Banner Photo */}
        <div className="relative w-full h-56 md:h-64 bg-slate-900 overflow-hidden">
          <FallbackImage
            src={coverImage}
            alt={groupName}
            fill
            fallbackSrc="/cover.webp"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Hero Body Info */}
        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{groupName}</h1>
              <p className="text-xs text-slate-400 font-medium mt-1">{memberCount}</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => showInfoToast('Invite link copied.')}
                className="px-4 py-2 bg-[#0D1627] border border-[#182740] rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 hover:bg-[#15243B] transition-colors"
              >
                <Plus size={14} />
                <span>Invite</span>
              </Button>

              <Button
                onClick={() => showInfoToast('Group link copied to clipboard.')}
                className="px-4 py-2 bg-[#0D1627] border border-[#182740] rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 hover:bg-[#15243B] transition-colors"
              >
                <Share2 size={14} />
                <span>Share</span>
              </Button>

              <Button
                onClick={() => setIsJoined(!isJoined)}
                className={`px-5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md ${
                  isJoined
                    ? 'bg-[#168BFF] hover:bg-[#147CE6] text-white shadow-[#168BFF]/20'
                    : 'bg-transparent text-[#168BFF] border border-[#168BFF] hover:bg-[#168BFF]/10'
                }`}
              >
                <span>{isJoined ? 'Joined' : 'Join Group'}</span>
                <ChevronDown size={14} />
              </Button>
            </div>
          </div>

          {/* Subnav Navigation Tabs */}
          <div className="flex items-center gap-8 border-t border-[#182740] pt-4 -mb-1">
            {(['posts', 'about', 'people', 'events', 'media', 'files'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const labels = {
                posts: 'Posts',
                about: 'About',
                people: 'People',
                events: 'Events',
                media: 'Media',
                files: 'Files',
              };
              return (
                <Button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-semibold relative pb-2 transition-colors ${
                    isActive
                      ? 'text-white after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-[#168BFF]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {labels[tab]}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB CONTENT: EVENTS */}
      {activeTab === 'events' && (
        <div className="flex flex-col gap-5 mt-2">
          {/* Header Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-100">Events</h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-48 md:w-56">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full h-9 pl-9 pr-3 bg-[#0D1627] border border-[#182740] rounded-xl text-xs text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#168BFF] transition-all"
                />
              </div>

              <Button className="h-9 px-3.5 bg-[#0D1627] border border-[#182740] rounded-xl text-xs font-medium text-slate-300 flex items-center gap-2 hover:bg-[#15243B] transition-colors">
                <Calendar size={13} />
                <span>Date Range</span>
                <ChevronDown size={12} className="text-slate-400" />
              </Button>

              <Button className="h-9 px-3.5 bg-[#0D1627] border border-[#182740] rounded-xl text-xs font-medium text-slate-300 flex items-center gap-2 hover:bg-[#15243B] transition-colors">
                <MapPin size={13} />
                <span>location</span>
                <ChevronDown size={12} className="text-slate-400" />
              </Button>

              <Button className="h-9 px-3.5 bg-[#0D1627] border border-[#182740] rounded-xl text-xs font-medium text-slate-300 flex items-center gap-2 hover:bg-[#15243B] transition-colors">
                <span>Upcoming</span>
                <ChevronDown size={12} className="text-slate-400" />
              </Button>

              <div className="h-9 bg-[#0D1627] border border-[#182740] rounded-xl p-1 flex items-center gap-1">
                <Button
                  onClick={() => setViewMode('list')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    viewMode === 'list' ? 'bg-[#15243B] text-[#168BFF]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="List View"
                >
                  <List size={14} />
                </Button>
                <Button
                  onClick={() => setViewMode('grid')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    viewMode === 'grid' ? 'bg-[#15243B] text-[#168BFF]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Grid View"
                >
                  <Grid size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* 3-Column Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {GROUP_EVENTS.map((ev) => (
              <div
                key={ev.id}
                className="bg-[#0A1220] border border-[#162238] rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg transition-all hover:border-[#1E3354]"
              >
                <div>
                  <div className="relative w-full aspect-[16/9] bg-slate-900 overflow-hidden">
                    <FallbackImage
                      src={ev.image}
                      alt={ev.title}
                      fill
                      className="object-cover w-full h-full"
                    />
                    <Button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2">
                      {ev.title}
                    </h3>

                    <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span>{ev.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <TrendingUp size={13} className="text-slate-400 shrink-0" />
                        <span>{ev.interestedCount} interested • {ev.goingCount} Going</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  {ev.buttonType === 'share' ? (
                    <Button
                      onClick={() => showInfoToast('Event link copied to clipboard.')}
                      className="w-full h-9 bg-[#1E293B] hover:bg-[#283850] text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Share2 size={14} />
                      <span>Share</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => showSuccessToast('Marked as Interested.')}
                      className="w-full h-9 bg-[#1E293B] hover:bg-[#283850] text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Star size={14} className="fill-slate-200 text-slate-200" />
                      <span>Interested</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: POSTS */}
      {activeTab === 'posts' && (
        <div className="bg-[#0A1220] border border-[#162238] rounded-2xl p-6 flex flex-col gap-3 mt-2">
          <h2 className="text-lg font-bold text-slate-100">Posts</h2>
          <p className="text-sm text-slate-400">Group updates and member posts appear here.</p>
        </div>
      )}

      {/* TAB CONTENT: ABOUT */}
      {activeTab === 'about' && (
        <div className="bg-[#0A1220] border border-[#162238] rounded-2xl p-6 flex flex-col gap-3 mt-2">
          <h2 className="text-lg font-bold text-slate-100">About {groupName}</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Official group for San Jose Sharks team members, fans, and families. Stay connected with game schedules, training camps, tournaments, and official announcements.
          </p>
        </div>
      )}

      {/* TAB CONTENT: PEOPLE */}
      {activeTab === 'people' && (
        <div className="bg-[#0A1220] border border-[#162238] rounded-2xl p-6 flex flex-col gap-3 mt-2">
          <h2 className="text-lg font-bold text-slate-100">Group Members</h2>
          <p className="text-sm text-slate-400">{memberCount} in this group.</p>
        </div>
      )}

      {/* TAB CONTENT: MEDIA */}
      {activeTab === 'media' && (
        <div className="bg-[#0A1220] border border-[#162238] rounded-2xl p-6 flex flex-col gap-3 mt-2">
          <h2 className="text-lg font-bold text-slate-100">Media</h2>
          <p className="text-sm text-slate-400">Photos and videos shared in this group.</p>
        </div>
      )}

      {/* TAB CONTENT: FILES */}
      {activeTab === 'files' && (
        <div className="bg-[#0A1220] border border-[#162238] rounded-2xl p-6 flex flex-col gap-3 mt-2">
          <h2 className="text-lg font-bold text-slate-100">Files</h2>
          <p className="text-sm text-slate-400">Documents and files uploaded by group members.</p>
        </div>
      )}
    </div>
  );
}

