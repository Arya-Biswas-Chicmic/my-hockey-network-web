import records from '@/demo-data/feed/records.json';
import type { FeedPostProps } from '@/components/features/home/FeedPostCard';
import type { PostItem } from '@my-hockey-network/core';

/**
 * Single shared feed dataset (product direction 2026-08-29: "add atleast 10
 * feed of mine and 20 other feeds in the feed section so total 30 feeds...
 * single data base will be used in multiple locations"). One canonical
 * record shape, projected into whatever prop shape each surface already
 * expects via the `toFeedPostProps`/`toPostItem` adapters below — so Home
 * feed, Profile > Posts, Profile > Media, and Saved all read the same 30
 * records instead of each keeping its own hand-copied fixture list.
 *
 * `isMine` marks the 10 records that represent the *viewer's own* posts —
 * adapters override the author identity on these with whoever is actually
 * signed in (via the `viewer` param), the same "fall back to the real
 * profile" trick `ProfilePostsTab` already used for `profile/feed.json`.
 * `isSaved` marks the subset of the 20 "other" records that show up on the
 * Saved page — a real bookmark feature isn't wired up yet, so this is the
 * one flag standing in for it everywhere "saved" is read.
 */
export interface DemoFeedRecord {
  id: string;
  isMine: boolean;
  isSaved: boolean;
  authorName: string;
  authorRole?: string;
  authorAvatar?: string;
  authorTime?: string;
  content: string;
  postImage?: string;
  images?: string[];
  eventDateTag?: string;
  eventLocation?: string;
  likesCount: number;
  commentsCount: number;
  repostCount?: number;
  isFollowing?: boolean;
}

export interface DemoFeedViewer {
  name?: string;
  avatar?: string;
  role?: string;
}

export const demoFeedRecords: readonly DemoFeedRecord[] = records as DemoFeedRecord[];

export function getMyDemoFeedRecords(): readonly DemoFeedRecord[] {
  return demoFeedRecords.filter((record) => record.isMine);
}

export function getOtherDemoFeedRecords(): readonly DemoFeedRecord[] {
  return demoFeedRecords.filter((record) => !record.isMine);
}

export function getSavedDemoFeedRecords(): readonly DemoFeedRecord[] {
  return demoFeedRecords.filter((record) => record.isSaved);
}

/** Home feed shape. `isMine` records get the real signed-in viewer's name/
 * avatar/role stamped on at render time — this is preview content authored
 * "as" the viewer, not a fixed fake name. */
export function toFeedPostProps(record: DemoFeedRecord, viewer?: DemoFeedViewer): FeedPostProps {
  return {
    id: record.id,
    authorId: record.isMine ? 'demo-profile-viewer' : record.id,
    authorName: record.isMine ? (viewer?.name || record.authorName) : record.authorName,
    authorRole: record.isMine ? (viewer?.role || record.authorRole) : record.authorRole,
    authorTime: record.authorTime,
    authorAvatar: record.isMine ? (viewer?.avatar || record.authorAvatar) : record.authorAvatar,
    content: record.content,
    postImage: record.postImage,
    images: record.images,
    eventDateTag: record.eventDateTag,
    likesCount: record.likesCount,
    commentsCount: record.commentsCount,
    repostCount: record.repostCount ?? 0,
    isFollowing: record.isFollowing ?? false,
    isSelf: record.isMine,
    demoMode: true,
  };
}

/** Profile > Posts tab shape (`PostItem`). Leaves `authorProfile.displayName`
 * / `avatarUrl` unset for `isMine` records — `ProfilePostsTab` already falls
 * back to the real viewer's `authorName`/`authorAvatar` props when those are
 * empty, and already treats an `author.id` starting with `demo-profile-` as
 * a self post, so no changes were needed there for this to work. */
export function toPostItem(record: DemoFeedRecord): PostItem {
  const media = record.images?.length
    ? record.images.map((url, index) => ({ id: `${record.id}-media-${index}`, url }))
    : record.postImage
      ? [{ id: `${record.id}-media-0`, url: record.postImage }]
      : [];

  return {
    id: record.id,
    body: record.content,
    audience: 'PUBLIC',
    createdAt: new Date().toISOString(),
    media,
    authorProfile: record.isMine
      ? { id: 'demo-profile-viewer', displayName: '', avatarUrl: null }
      : {
          id: record.id,
          displayName: record.authorName,
          avatarUrl: record.authorAvatar || null,
          roleTag: record.authorRole,
        },
    likeCount: record.likesCount,
    commentCount: record.commentsCount,
    repostCount: record.repostCount ?? 0,
    userReaction: null,
  } as unknown as PostItem;
}

/** Profile > Media tab derives its grid from the viewer's own (`isMine`)
 * posts' images — replacing the old standalone, unrelated `profile/media.json`
 * fixture so a photo posted to the feed is the same photo shown here. */
export function getMyDemoMediaItems(): { id: string; src: string; alt: string }[] {
  return getMyDemoFeedRecords().flatMap((record) => {
    const urls = record.images?.length ? record.images : record.postImage ? [record.postImage] : [];
    return urls.map((src, index) => ({ id: `${record.id}-media-${index}`, src, alt: record.content }));
  });
}
