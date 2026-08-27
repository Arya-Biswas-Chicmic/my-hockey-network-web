// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Modal } from '@/components/ui/modal';

afterEach(cleanup);

describe('Modal accessibility and keyboard behavior', () => {
  it('exposes dialog ARIA semantics with the given accessible name', () => {
    render(
      <Modal open onClose={vi.fn()} title="Delete post">
        <p>Are you sure?</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Delete post' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('moves focus onto the dialog card when it opens', async () => {
    render(
      <Modal open onClose={vi.fn()} title="Delete post">
        <p>Are you sure?</p>
      </Modal>,
    );
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('dialog')));
  });

  it('closes on Escape by default', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Delete post">
        <p>Are you sure?</p>
      </Modal>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close on Escape when closeOnEscape is false (e.g. mid-submit)', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Deleting…" closeOnEscape={false}>
        <p>Please wait.</p>
      </Modal>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores non-Escape keys', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Delete post">
        <p>Are you sure?</p>
      </Modal>,
    );
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: 'a' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on a click directly on the overlay (outside the card) by default', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Delete post">
        <p>Are you sure?</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when clicking inside the card content', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Delete post">
        <p>Are you sure?</p>
      </Modal>,
    );
    fireEvent.click(screen.getByText('Are you sure?'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close on overlay click when closeOnOverlayClick is false', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Deleting…" closeOnOverlayClick={false}>
        <p>Please wait.</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders nothing, and does not respond to Escape, while closed', () => {
    const onClose = vi.fn();
    render(
      <Modal open={false} onClose={onClose} title="Delete post">
        <p>Are you sure?</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('removes its Escape listener on unmount (no leak, no stale onClose call)', () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <Modal open onClose={onClose} title="Delete post">
        <p>Are you sure?</p>
      </Modal>,
    );
    unmount();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
