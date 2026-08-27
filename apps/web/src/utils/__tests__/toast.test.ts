// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@my-hockey-network/api-client';
import { ToastTypeEnum } from '@my-hockey-network/contracts';
import {
  extractErrorMessage,
  getApiErrorStatus,
  getApiErrorKey,
  showToast,
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  TOAST_EVENT,
  type ToastOptions,
} from '@/utils/toast';

/** Runs `action`, which is expected to synchronously dispatch one TOAST_EVENT, and returns its detail. */
function captureToast(action: () => void): ToastOptions | undefined {
  let captured: ToastOptions | undefined;
  const listener = (event: Event) => {
    captured = (event as CustomEvent<ToastOptions>).detail;
  };
  window.addEventListener(TOAST_EVENT, listener);
  try {
    action();
  } finally {
    window.removeEventListener(TOAST_EVENT, listener);
  }
  return captured;
}

describe('extractErrorMessage', () => {
  it('returns the fallback for a falsy error', () => {
    expect(extractErrorMessage(null, 'fallback')).toBe('fallback');
    expect(extractErrorMessage(undefined, 'fallback')).toBe('fallback');
  });

  it('uses ApiError.message when present', () => {
    expect(extractErrorMessage(new ApiError(500, 'Server exploded'), 'fallback')).toBe('Server exploded');
  });

  it('uses Error.message when present', () => {
    expect(extractErrorMessage(new Error('Boom'), 'fallback')).toBe('Boom');
  });

  it('returns a non-empty string error as-is', () => {
    expect(extractErrorMessage('Something went wrong', 'fallback')).toBe('Something went wrong');
  });

  it('falls back for a whitespace-only string error', () => {
    expect(extractErrorMessage('   ', 'fallback')).toBe('fallback');
  });

  it('reads a `message` string field off a plain error-shaped object', () => {
    expect(extractErrorMessage({ message: 'Backend said no' }, 'fallback')).toBe('Backend said no');
  });

  it('joins a `message` array field into a single string', () => {
    expect(extractErrorMessage({ message: ['Field A is required', 'Field B is invalid'] }, 'fallback')).toBe(
      'Field A is required, Field B is invalid',
    );
  });

  it('falls back to an `error` string field when `message` is absent', () => {
    expect(extractErrorMessage({ error: 'Unauthorized' }, 'fallback')).toBe('Unauthorized');
  });

  it('returns the fallback when nothing recognizable is found', () => {
    expect(extractErrorMessage({ statusCode: 500 }, 'fallback')).toBe('fallback');
    expect(extractErrorMessage(42, 'fallback')).toBe('fallback');
  });
});

describe('getApiErrorStatus', () => {
  it('reads statusCode off an ApiError', () => {
    expect(getApiErrorStatus(new ApiError(404, 'Not found'))).toBe(404);
  });

  it('reads a numeric statusCode or status field off a plain object', () => {
    expect(getApiErrorStatus({ statusCode: 400 })).toBe(400);
    expect(getApiErrorStatus({ status: 401 })).toBe(401);
  });

  it('returns undefined when no numeric status is present', () => {
    expect(getApiErrorStatus(null)).toBeUndefined();
    expect(getApiErrorStatus('nope')).toBeUndefined();
    expect(getApiErrorStatus({ statusCode: '500' })).toBeUndefined();
  });
});

describe('getApiErrorKey', () => {
  it('reads key off an ApiError, derived from a `{ key }` data payload', () => {
    const err = new ApiError(403, 'Forbidden', { key: 'GUARDIAN_DISABLED' });
    expect(getApiErrorKey(err)).toBe('GUARDIAN_DISABLED');
  });

  it('falls back to the message as the key when ApiError data has no key field', () => {
    const err = new ApiError(403, 'Forbidden');
    expect(getApiErrorKey(err)).toBe('Forbidden');
  });

  it('reads a string key field off a plain object', () => {
    expect(getApiErrorKey({ key: 'USER_NOT_FOUND' })).toBe('USER_NOT_FOUND');
  });

  it('returns undefined when no string key is present', () => {
    expect(getApiErrorKey(null)).toBeUndefined();
    expect(getApiErrorKey({ key: 123 })).toBeUndefined();
  });
});

describe('showToast dispatchers', () => {
  it('showToast dispatches a TOAST_EVENT carrying the given message/type', () => {
    const detail = captureToast(() => showToast('Saved!', ToastTypeEnum.SUCCESS));
    expect(detail).toMatchObject({ message: 'Saved!', type: ToastTypeEnum.SUCCESS });
  });

  it('showToast accepts an options object and defaults type to info', () => {
    const detail = captureToast(() => showToast({ message: 'Heads up' }));
    expect(detail).toMatchObject({ message: 'Heads up', type: ToastTypeEnum.INFO });
  });

  it('showSuccessToast dispatches a success-typed toast with the given action', () => {
    const onActionClick = vi.fn();
    const detail = captureToast(() => showSuccessToast('Post created', 'Undo', onActionClick));
    expect(detail).toMatchObject({ message: 'Post created', type: ToastTypeEnum.SUCCESS, actionText: 'Undo' });
    expect(detail?.onActionClick).toBe(onActionClick);
  });

  it('showErrorToast extracts a message from a raw error when no fallback message is given', () => {
    const detail = captureToast(() => showErrorToast(new Error('Network down')));
    expect(detail).toMatchObject({ message: 'Network down', type: ToastTypeEnum.ERROR });
  });

  it('showErrorToast uses a plain string error as the message directly', () => {
    const detail = captureToast(() => showErrorToast('Could not save changes'));
    expect(detail).toMatchObject({ message: 'Could not save changes', type: ToastTypeEnum.ERROR });
  });

  it('showErrorToast prefers the caller-supplied fallback message over the feature-safe one', () => {
    const detail = captureToast(() =>
      showErrorToast(new ApiError(502, 'Internal server error'), 'Failed to update post. Please try again.'),
    );
    expect(detail).toMatchObject({
      message: 'Failed to update post. Please try again.',
      type: ToastTypeEnum.ERROR,
    });
    expect(detail?.actionText).toBeUndefined();
  });

  it('showInfoToast dispatches an info-typed toast', () => {
    const detail = captureToast(() => showInfoToast('You are now following this profile.'));
    expect(detail).toMatchObject({ message: 'You are now following this profile.', type: ToastTypeEnum.INFO });
  });
});
