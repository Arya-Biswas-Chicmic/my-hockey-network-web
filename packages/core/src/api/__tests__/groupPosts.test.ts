import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getGroupPosts } from '../postsApi';
import * as clientModule from '../client';

describe('group post API', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('requests posts by group id and normalizes the direct response', async () => {
    const response = { items: [{ id: 'post-1', body: 'Update' }], nextCursor: null };
    const request = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue(response);
    await expect(getGroupPosts('group-1', 25)).resolves.toEqual(response);
    expect(request).toHaveBeenCalledWith(
      '/posts?groupId=group-1&limit=25',
      { method: 'GET' },
      'web',
    );
  });

  it('normalizes a backend data envelope', async () => {
    const response = { items: [], nextCursor: null };
    vi.spyOn(clientModule, 'apiFetch').mockResolvedValue({ data: response });
    await expect(getGroupPosts('group-2')).resolves.toEqual(response);
  });
});
