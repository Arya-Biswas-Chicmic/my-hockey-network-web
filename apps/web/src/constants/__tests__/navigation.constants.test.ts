import { describe, expect, it } from 'vitest';

import {
  getNavigationItemById,
  isNavigationItemActive,
  NAVIGATION_ITEMS,
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

  it('maps every visible route to its matching Figma icon family', () => {
    expect(NAVIGATION_ITEMS.map(({ id, icon }) => [id, icon])).toEqual([
      ['home', 'home'],
      ['messaging', 'messaging'],
      ['explore', 'explore'],
      ['events', 'events'],
      ['groups', 'groups'],
      ['connections', 'network'],
      ['teams', 'teams'],
      ['notifications', 'notifications'],
      ['saved', 'saved'],
      ['profile', 'profile'],
    ]);
  });
});
