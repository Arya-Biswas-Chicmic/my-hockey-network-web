import { describe, expect, it } from 'vitest';

import {
  getNavigationItemById,
  isNavigationItemActive,
} from '@/constants/navigation.constants';

describe('navigation route matching', () => {
  it('matches exact and nested App Router paths', () => {
    const profile = getNavigationItemById('profile');

    expect(profile).toBeDefined();
    expect(isNavigationItemActive('/profile', profile!)).toBe(true);
    expect(isNavigationItemActive('/profile/guardian-requests', profile!)).toBe(true);
    expect(isNavigationItemActive('/home', profile!)).toBe(false);
  });

  it('maps the event detail route to the Events navigation item', () => {
    const events = getNavigationItemById('events');

    expect(events).toBeDefined();
    expect(isNavigationItemActive('/event-detail', events!)).toBe(true);
  });

  it('does not treat similarly prefixed routes as active', () => {
    const home = getNavigationItemById('home');

    expect(home).toBeDefined();
    expect(isNavigationItemActive('/homepage', home!)).toBe(false);
  });
});
