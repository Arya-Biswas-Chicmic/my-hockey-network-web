// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PermissionControlKey } from '@my-hockey-network/contracts';
import { supervisionBlockedMessage } from '@my-hockey-network/domain';
import { PostCardActions } from '@/components/features/home/PostCardActions';

const showErrorToast = vi.fn();
const showInfoToast = vi.fn();

vi.mock('@/utils/toast', () => ({
  showErrorToast: (...args: unknown[]) => showErrorToast(...args),
  showInfoToast: (...args: unknown[]) => showInfoToast(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderActions(overrides: Partial<React.ComponentProps<typeof PostCardActions>> = {}) {
  return render(
    <PostCardActions
      postId="post-1"
      isSelf={false}
      canReact
      canComment
      canShare
      isLiked={false}
      likes={0}
      isLiking={false}
      onLike={vi.fn()}
      showComments={false}
      onToggleComments={vi.fn()}
      currentCommentsCount={0}
      onCommentAdded={vi.fn()}
      hasReposted={false}
      reposts={0}
      isSharing={false}
      isRepostMenuOpen={false}
      onRepostButtonClick={vi.fn()}
      onCloseRepostMenu={vi.fn()}
      onChooseRepost={vi.fn()}
      onChooseQuote={vi.fn()}
      {...overrides}
    />,
  );
}

describe('PostCardActions — SHARE_POSTS gating', () => {
  const shareBlocked = supervisionBlockedMessage(PermissionControlKey.SHARE_POSTS);

  it('lets the Send action through when sharing is enabled', () => {
    renderActions({ canShare: true });

    fireEvent.click(screen.getByRole('button', { name: 'Send post' }));
    expect(showInfoToast).toHaveBeenCalled();
    expect(showErrorToast).not.toHaveBeenCalled();
  });

  // Send is external sharing, so the same control governs it as the repost
  // button — previously it was the one share action a guardian could not
  // restrict.
  it('blocks the Send action and explains why when sharing is disabled', () => {
    renderActions({ canShare: false });

    fireEvent.click(screen.getByRole('button', { name: `Send post — ${shareBlocked}` }));
    expect(showErrorToast).toHaveBeenCalledWith(shareBlocked);
    expect(showInfoToast).not.toHaveBeenCalled();
  });

  it('keeps the Send control focusable so the reason stays reachable', () => {
    renderActions({ canShare: false });

    const send = screen.getByRole('button', { name: `Send post — ${shareBlocked}` }) as HTMLButtonElement;
    expect(send.disabled).toBe(false);
    expect(send.className).toContain('mhn-action-item-blocked');
  });

  it('governs Send and Repost with the same control', () => {
    renderActions({ canShare: false });

    expect(screen.getByRole('button', { name: `Send post — ${shareBlocked}` })).toBeTruthy();
    expect(screen.getByRole('button', { name: `Repost — ${shareBlocked}` })).toBeTruthy();
  });
});
