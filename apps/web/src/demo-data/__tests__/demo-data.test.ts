import { describe, expect, it } from 'vitest';
import { getConnectionDemoMembers } from '@/demo-data/connections';
import { getHomeFeedDemoPosts } from '@/demo-data/home';
import { HomeFeedTab } from '@/types/home.types';
import { demoEventDetail } from '@/demo-data/events';
import { demoGroupDetail, discoverDemoGroups, yourDemoGroups } from '@/demo-data/groups';

describe('centralized home demo data', () => {
  it.each(Object.values(HomeFeedTab))('provides a scrollable %s feed with stable demo IDs', (tab) => {
    const posts = getHomeFeedDemoPosts(tab);
    // FOR_YOU draws on the shared 30-record feed dataset (10 "mine" + 20
    // "other" — @/demo-data/feed); Network/Groups keep their own smaller
    // fixture files.
    expect(posts).toHaveLength(tab === HomeFeedTab.FOR_YOU ? 30 : 10);
    expect(new Set(posts.map((post) => post.id)).size).toBe(posts.length);
    expect(posts.every((post) => post.id.startsWith('demo-') && post.demoMode)).toBe(true);
  });

  it('includes multi-image posts in every feed category', () => {
    for (const tab of Object.values(HomeFeedTab)) {
      expect(getHomeFeedDemoPosts(tab).some((post) => (post.images?.length ?? 0) > 1)).toBe(true);
    }
  });
});

describe('centralized connections demo data', () => {
  it.each(['following', 'followers'] as const)('provides a populated %s tab', (tab) => {
    const members = getConnectionDemoMembers(tab);
    expect(members.length).toBeGreaterThanOrEqual(10);
    expect(members.every((member) => member.type === tab && member.id.startsWith('demo-'))).toBe(true);
  });
});

describe('centralized event and group detail demo data', () => {
  it('provides the event metadata and complete organiser list used by the detail screen', () => {
    expect(demoEventDetail.title).toContain('Heritage Classic');
    expect(demoEventDetail.thingsToKnow).toHaveLength(7);
    expect(demoEventDetail.people.length).toBeGreaterThanOrEqual(8);
    expect(new Set(demoEventDetail.people.map((person) => person.id)).size).toBe(demoEventDetail.people.length);
  });

  it('populates every group detail tab from one fixture', () => {
    expect(demoGroupDetail.posts.length).toBeGreaterThan(0);
    expect(demoGroupDetail.about.description).toBeTruthy();
    expect(demoGroupDetail.people.length).toBeGreaterThan(0);
    expect(demoGroupDetail.events.length).toBeGreaterThan(0);
    expect(demoGroupDetail.media.length).toBeGreaterThan(0);
    expect(demoGroupDetail.files.length).toBeGreaterThan(0);
    expect([...yourDemoGroups, ...discoverDemoGroups].every((group) => group.id.startsWith('grp-'))).toBe(true);
  });
});
