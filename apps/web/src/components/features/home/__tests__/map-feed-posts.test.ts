import { describe, expect, it } from 'vitest';

import { mapFeedPosts } from '@/components/features/home/map-feed-posts';

describe('mapFeedPosts', () => {
  it('skips records without a backend post identifier', () => {
    expect(mapFeedPosts([{ body: 'draft' }], {})).toEqual([]);
  });

  it('maps legacy identifiers and determines profile ownership', () => {
    const result = mapFeedPosts([{
      _id: 'post-1',
      body: 'Goal update',
      authorProfileId: 'profile-1',
      author: { id: 'profile-1', displayName: 'Alex', position: 'Center', jerseyNumber: 9 },
      likeCount: 2,
    }], { profileId: 'profile-1' });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'post-1',
      authorName: 'Alex',
      authorRole: 'Center • #9',
      likesCount: 2,
      isSelf: true,
    });
  });
});
