// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PermissionControlKey } from '@my-hockey-network/contracts';
import { supervisionBlockedMessage } from '@my-hockey-network/domain';
import { FollowSuggestionItem } from '@/components/features/home/FollowSuggestionItem';

// The card also opens a profile on click, which reaches AuthProvider — not the
// behaviour under test here.
vi.mock('@/hooks/use-profile-click', () => ({
  useProfileClickHandler: () => vi.fn(),
}));

afterEach(cleanup);

const USER = { id: 'u1', name: 'Connor McDavid', avatar: '', isFollowing: false };

describe('FollowSuggestionItem — FOLLOW_OTHERS gating', () => {
  const blocked = supervisionBlockedMessage(PermissionControlKey.FOLLOW_OTHERS);

  it('marks the follow control as blocked when the guardian disabled following', () => {
    render(<FollowSuggestionItem user={USER} onFollow={vi.fn()} canFollow={false} />);

    const follow = screen.getByRole('button', { name: 'Follow' });
    expect(follow.getAttribute('title')).toBe(blocked);
    expect(follow.className).toContain('mhn-action-item-blocked');
  });

  it('leaves the control unmarked when following is allowed', () => {
    render(<FollowSuggestionItem user={USER} onFollow={vi.fn()} canFollow />);

    const follow = screen.getByRole('button', { name: 'Follow' });
    expect(follow.getAttribute('title')).toBeNull();
    expect(follow.className).not.toContain('mhn-action-item-blocked');
  });

  // Not `disabled`: the handler explains the reason, and disabling would drop
  // the control from the tab order and suppress its own tooltip.
  it('keeps the blocked control pressable so the reason stays reachable', () => {
    const onFollow = vi.fn();
    render(<FollowSuggestionItem user={USER} onFollow={onFollow} canFollow={false} />);

    const follow = screen.getByRole('button', { name: 'Follow' }) as HTMLButtonElement;
    expect(follow.disabled).toBe(false);

    fireEvent.click(follow);
    expect(onFollow).toHaveBeenCalledTimes(1);
  });

  it('treats following as allowed when the prop is omitted', () => {
    render(<FollowSuggestionItem user={USER} onFollow={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Follow' }).getAttribute('title')).toBeNull();
  });
});
