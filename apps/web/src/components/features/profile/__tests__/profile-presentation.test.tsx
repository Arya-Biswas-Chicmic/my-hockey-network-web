// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { ProfileHeroCard, formatDobDisplay, formatProfileCount } from '@/components/features/profile/ProfileHeroCard';
import { profileDemoData } from '@/demo-data/profile';
import { getMyDemoFeedRecords, getMyDemoMediaItems } from '@/demo-data/feed';
import { calculateAge } from '@/hooks/use-profile-view-model';
import { ProfileTabEnum } from '@my-hockey-network/contracts';

describe('profile presentation helpers', () => {
  it('formats profile counts and dates for the Figma presentation', () => {
    expect(formatProfileCount(999)).toBe('999');
    expect(formatProfileCount(1_500_000)).toBe('1.5M');
    expect(formatDobDisplay('1995-04-10')).toBe('Apr 10, 1995');
    expect(formatDobDisplay('invalid')).toBe('—');
  });

  it('calculates age without an early birthday off-by-one', () => {
    expect(calculateAge('2000-09-10', new Date('2026-08-28T12:00:00Z'))).toBe(25);
    expect(calculateAge('2000-07-10', new Date('2026-08-28T12:00:00Z'))).toBe(26);
    expect(calculateAge('invalid', new Date('2026-08-28T12:00:00Z'))).toBeNull();
  });

  it('keeps every profile placeholder in the centralized demo-data source', () => {
    expect(profileDemoData.events).toHaveLength(2);
    expect(profileDemoData.stats.metrics).toHaveLength(6);
    expect(profileDemoData.teams).toHaveLength(2);
    expect(profileDemoData.people).toHaveLength(5);
    expect(profileDemoData.profile.avatarUrl).toMatch(/^\/demo\/profile\//);
    // Feed/media come from the shared `@/demo-data/feed` dataset now (10
    // "mine" records — see that module's header comment).
    expect(getMyDemoFeedRecords()).toHaveLength(10);
    expect(getMyDemoMediaItems().length).toBeGreaterThan(0);
  });

  it('renders the Figma action order and exposes tab changes through callbacks', () => {
    const onEdit = vi.fn();
    const onShare = vi.fn();
    const onTabChange = vi.fn();
    render(
      <ProfileHeroCard
        avatar="/userPlaceholder.webp"
        name="Test Player"
        isUploadingAvatar={false}
        onAvatarFileChange={vi.fn()}
        isOwnProfile={false}
        canEditProfile
        onEditProfileClick={onEdit}
        onShareProfileClick={onShare}
        followers={1500000}
        following={12}
        roleSubtitle="C • #19"
        age={26}
        dob="2000-04-10"
        position="Center"
        shoots="Left"
        height={'6\' 1"'}
        weight="190 lbs"
        activeProfileTab={ProfileTabEnum.POSTS}
        onProfileTabChange={onTabChange}
        canViewGuardianInvites={false}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.findIndex((button) => button.textContent === 'Edit Profile'))
      .toBeLessThan(buttons.findIndex((button) => button.textContent === 'Share Profile'));
    fireEvent.click(screen.getByRole('tab', { name: 'Media' }));
    expect(onTabChange).toHaveBeenCalledWith(ProfileTabEnum.MEDIA);
  });
});
