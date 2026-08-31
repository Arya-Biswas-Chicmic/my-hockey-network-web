// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PermissionControlKey } from '@my-hockey-network/contracts';
import { supervisionBlockedMessage } from '@my-hockey-network/domain';
import { PermissionGate, PermissionNotice, useGatedAction } from '@/components/common/PermissionGate';
import { Button } from '@/components/common/Button';

const checkSupervisionPermission = vi.fn();
const showToast = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ checkSupervisionPermission, showToast }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PermissionGate', () => {
  it('renders its children when the control is enabled', () => {
    checkSupervisionPermission.mockReturnValue(true);
    render(
      <PermissionGate control={PermissionControlKey.COMMENT_ON_POSTS} blockedAs="notice">
        <Button type="button">Write a comment</Button>
      </PermissionGate>,
    );
    expect(screen.getByRole('button', { name: 'Write a comment' })).toBeTruthy();
  });

  it('replaces the action with the control-specific reason when blocked', () => {
    checkSupervisionPermission.mockReturnValue(false);
    render(
      <PermissionGate control={PermissionControlKey.COMMENT_ON_POSTS} blockedAs="notice">
        <Button type="button">Write a comment</Button>
      </PermissionGate>,
    );

    expect(screen.queryByRole('button', { name: 'Write a comment' })).toBeNull();
    expect(
      screen.getByText(supervisionBlockedMessage(PermissionControlKey.COMMENT_ON_POSTS)),
    ).toBeTruthy();
  });

  it('renders nothing when blockedAs is hide', () => {
    checkSupervisionPermission.mockReturnValue(false);
    const { container } = render(
      <PermissionGate control={PermissionControlKey.CREATE_POST} blockedAs="hide">
        <Button type="button">Post</Button>
      </PermissionGate>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('keeps children by default so the action can explain itself on click', () => {
    checkSupervisionPermission.mockReturnValue(false);
    render(
      <PermissionGate control={PermissionControlKey.REACT_TO_POSTS}>
        <Button type="button">Like</Button>
      </PermissionGate>,
    );
    expect(screen.getByRole('button', { name: 'Like' })).toBeTruthy();
  });

  it('accepts an override message', () => {
    checkSupervisionPermission.mockReturnValue(false);
    render(
      <PermissionGate control={PermissionControlKey.SHARE_POSTS} blockedAs="notice" message="Sharing is off.">
        <Button type="button">Share</Button>
      </PermissionGate>,
    );
    expect(screen.getByText('Sharing is off.')).toBeTruthy();
  });
});

function GatedButton({ control }: { control: PermissionControlKey }) {
  const action = useGatedAction(control);
  const onAllowed = vi.fn();
  return (
    <Button type="button" title={action.title} onClick={() => action.run(onAllowed)}>
      {action.allowed ? 'Enabled' : 'Locked'}
    </Button>
  );
}

describe('useGatedAction', () => {
  it('runs the action and sets no title when allowed', () => {
    checkSupervisionPermission.mockReturnValue(true);
    render(<GatedButton control={PermissionControlKey.COMMENT_ON_POSTS} />);

    const button = screen.getByRole('button');
    expect(button.getAttribute('title')).toBeNull();
    fireEvent.click(button);
    expect(showToast).not.toHaveBeenCalled();
  });

  it('blocks the action and explains why via a toast', () => {
    checkSupervisionPermission.mockReturnValue(false);
    render(<GatedButton control={PermissionControlKey.COMMENT_ON_POSTS} />);

    const button = screen.getByRole('button');
    expect(button.getAttribute('title')).toBe(
      supervisionBlockedMessage(PermissionControlKey.COMMENT_ON_POSTS),
    );

    fireEvent.click(button);
    expect(showToast).toHaveBeenCalledWith(
      supervisionBlockedMessage(PermissionControlKey.COMMENT_ON_POSTS),
      'error',
    );
  });
});

describe('supervisionBlockedMessage', () => {
  it('gives each gated action its own wording', () => {
    const comment = supervisionBlockedMessage(PermissionControlKey.COMMENT_ON_POSTS);
    const post = supervisionBlockedMessage(PermissionControlKey.CREATE_POST);
    expect(comment).not.toBe(post);
  });

  it('falls back for a control with no specific copy', () => {
    expect(supervisionBlockedMessage('SOME_UNKNOWN_CONTROL')).toBe(
      'Your parent/guardian has disabled this feature.',
    );
  });
});

describe('PermissionNotice', () => {
  // Rendered directly by screens that have already branched on the permission
  // (Home swaps its whole feed column), so it must not re-check it.
  it('shows the control-specific message without consulting the permission', () => {
    checkSupervisionPermission.mockReturnValue(true);
    render(<PermissionNotice control={PermissionControlKey.VIEW_FEED} />);

    expect(
      screen.getByText(supervisionBlockedMessage(PermissionControlKey.VIEW_FEED)),
    ).toBeTruthy();
    expect(checkSupervisionPermission).not.toHaveBeenCalled();
  });

  it('accepts an override message', () => {
    render(<PermissionNotice control={PermissionControlKey.VIEW_FEED} message="Feed is off." />);
    expect(screen.getByText('Feed is off.')).toBeTruthy();
  });

  it('is exposed as a note for assistive technology', () => {
    render(<PermissionNotice control={PermissionControlKey.VIEW_FEED} />);
    expect(screen.getByRole('note')).toBeTruthy();
  });
});
