// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { PermissionControlKey } from '@my-hockey-network/contracts';
import {
  canComment,
  canCreatePost,
  canSharePost,
  canLikePost,
  canFollowOthers,
  canViewFeed,
} from '@my-hockey-network/domain';
import type { AuthMeResponse } from '@my-hockey-network/contracts';

/**
 * The exact control keys `GET /supervision/me/permissions` returns, flattened
 * the way `getMySupervisionPermissions` flattens them (`controlsMap`).
 *
 * These are SCREAMING_SNAKE. Call sites previously passed lowercase strings
 * (`'comment_on_posts'`, `'create_posts'`) which the auth context normalised to
 * snake_case and camelCase but never to the uppercase form the payload actually
 * uses — so every lookup returned `undefined`, which is not `true`, and every
 * supervised action read as blocked no matter what the guardian had enabled.
 */
const API_CONTROLS: Record<string, boolean | string> = {
  VIEW_FEED: false,
  CREATE_POST: false,
  COMMENT_ON_POSTS: false,
  REACT_TO_POSTS: true,
  SHARE_POSTS: false,
  FOLLOW_OTHERS: true,
  ACCEPT_CONNECTIONS: true,
  SEND_MESSAGES: false,
  RECEIVE_MESSAGES: true,
  CREATE_GROUP_CHATS: false,
};

const MINOR: AuthMeResponse = {
  primaryRole: 'PLAYER',
  isProfileCompleted: true,
  // An approved minor: guardian approval is satisfied, so the only thing left
  // gating each action is the supervision control map.
  guardianship: { required: true, approved: true },
  profile: {
    id: 'child-1',
    isMinor: true,
    displayName: 'Child Player',
    accessLevel: 'SUPERVISED',
  },
} as unknown as AuthMeResponse;

describe('supervision control keys match the live API payload', () => {
  it('exposes every control the endpoint returns', () => {
    // Guards against the enum drifting from the backend contract.
    for (const key of [
      PermissionControlKey.VIEW_FEED,
      PermissionControlKey.CREATE_POST,
      PermissionControlKey.COMMENT_ON_POSTS,
      PermissionControlKey.REACT_TO_POSTS,
      PermissionControlKey.SHARE_POSTS,
      PermissionControlKey.FOLLOW_OTHERS,
      PermissionControlKey.SEND_MESSAGES,
      PermissionControlKey.CREATE_GROUP_CHATS,
    ]) {
      expect(Object.hasOwn(API_CONTROLS, key)).toBe(true);
    }
  });

  // The enum is singular (`CREATE_POST`); a plural `create_posts` call site
  // could never resolve against this payload.
  it('uses the singular CREATE_POST key the API returns', () => {
    expect(PermissionControlKey.CREATE_POST).toBe('CREATE_POST');
    expect(Object.hasOwn(API_CONTROLS, 'CREATE_POSTS')).toBe(false);
  });
});

describe('domain predicates read the API payload correctly', () => {
  // VIEW_FEED is false in this payload, which blocks the feed wholesale — so
  // these are checked against a payload where viewing is allowed, isolating the
  // per-action controls.
  const viewable = { ...API_CONTROLS, VIEW_FEED: true };

  it('blocks the actions the guardian disabled', () => {
    expect(canCreatePost(MINOR, viewable)).toBe(false);
    expect(canComment(MINOR, viewable)).toBe(false);
    expect(canSharePost(MINOR, viewable)).toBe(false);
  });

  it('allows the actions the guardian enabled', () => {
    expect(canLikePost(MINOR, viewable)).toBe(true);
    expect(canFollowOthers(MINOR, viewable)).toBe(true);
  });
});

describe('VIEW_FEED gates reading the feed at all', () => {
  // Regression: the Home screen used to render the pending banner *above* a
  // fully populated feed, so a child whose guardian had disabled viewing could
  // still read every post.
  it('blocks viewing when the guardian disabled VIEW_FEED', () => {
    expect(canViewFeed(MINOR, API_CONTROLS)).toBe(false);
  });

  it('allows viewing once the guardian enables it', () => {
    expect(canViewFeed(MINOR, { ...API_CONTROLS, VIEW_FEED: true })).toBe(true);
  });

  it('does not restrict an unsupervised user', () => {
    expect(canViewFeed(MINOR, null)).toBe(true);
  });
});
