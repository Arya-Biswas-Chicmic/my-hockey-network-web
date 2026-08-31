// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PermissionControlKey } from '@my-hockey-network/contracts';
import { supervisionBlockedMessage } from '@my-hockey-network/domain';
import { PermissionCard } from '@/components/common/PermissionCard';

afterEach(cleanup);

describe('PermissionCard', () => {
  it('describes the restriction using the control-specific copy', () => {
    render(<PermissionCard control={PermissionControlKey.VIEW_FEED} />);

    expect(
      screen.getByText(supervisionBlockedMessage(PermissionControlKey.VIEW_FEED)),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Restricted by your guardian' })).toBeTruthy();
  });

  it('accepts an override title and message', () => {
    render(
      <PermissionCard
        control={PermissionControlKey.VIEW_FEED}
        title="Feed unavailable"
        message="Ask your parent to turn this on."
      />,
    );

    expect(screen.getByRole('heading', { name: 'Feed unavailable' })).toBeTruthy();
    expect(screen.getByText('Ask your parent to turn this on.')).toBeTruthy();
  });

  // Unlike ServerDownScreen there is often nothing for the child to do, so the
  // action is opt-in rather than always present.
  it('renders no action by default', () => {
    render(<PermissionCard control={PermissionControlKey.VIEW_FEED} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders the action only when both a label and a handler are supplied', () => {
    const onAction = vi.fn();
    const { rerender } = render(
      <PermissionCard control={PermissionControlKey.VIEW_FEED} actionLabel="Ask my parent" />,
    );
    expect(screen.queryByRole('button')).toBeNull();

    rerender(
      <PermissionCard
        control={PermissionControlKey.VIEW_FEED}
        actionLabel="Ask my parent"
        onAction={onAction}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ask my parent' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('is exposed as a note rather than an alert', () => {
    // A guardian restriction is a normal state of the app, not an error.
    render(<PermissionCard control={PermissionControlKey.VIEW_FEED} />);
    expect(screen.getByRole('note')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('gives different controls their own message', () => {
    const { rerender } = render(<PermissionCard control={PermissionControlKey.VIEW_FEED} />);
    const feedCopy = supervisionBlockedMessage(PermissionControlKey.VIEW_FEED);
    expect(screen.getByText(feedCopy)).toBeTruthy();

    rerender(<PermissionCard control={PermissionControlKey.SEND_MESSAGES} />);
    expect(screen.getByText(supervisionBlockedMessage(PermissionControlKey.SEND_MESSAGES))).toBeTruthy();
    expect(screen.queryByText(feedCopy)).toBeNull();
  });
});
