// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@my-hockey-network/api-client';
import { showErrorToast, TOAST_EVENT, type ToastOptions } from '@/utils/toast';

describe('error toast', () => {
  it('uses the feature-safe fallback as the message rather than an action label', () => {
    const listener = vi.fn();
    window.addEventListener(TOAST_EVENT, listener);

    showErrorToast(new ApiError(502, 'Internal server error'), 'Failed to update post. Please try again.');

    const event = listener.mock.calls[0]?.[0] as CustomEvent<ToastOptions>;
    expect(event.detail).toMatchObject({
      message: 'Failed to update post. Please try again.',
      type: 'error',
    });
    expect(event.detail.actionText).toBeUndefined();
    window.removeEventListener(TOAST_EVENT, listener);
  });
});

