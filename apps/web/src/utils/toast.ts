import { ApiError } from '@my-hockey-network/api-client';
import { ToastTypeEnum } from '@my-hockey-network/contracts';
import { ERROR_MESSAGES } from '@my-hockey-network/constants';

export type ToastType = ToastTypeEnum | 'success' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  actionText?: string;
  onActionClick?: () => void;
  duration?: number;
}

export const TOAST_EVENT = 'mhn:toast';

/**
 * Extracts a dynamic, clean error message string from an Error, ApiError, or unknown object.
 */
export function extractErrorMessage(error: unknown, fallbackMessage: string = ERROR_MESSAGES.DEFAULT_UNEXPECTED): string {
  if (!error) return fallbackMessage;

  if (error instanceof ApiError) {
    return error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === 'string' && errObj.message.trim()) {
      return errObj.message;
    }
    if (Array.isArray(errObj.message) && errObj.message.length > 0) {
      return errObj.message.join(', ');
    }
    if (typeof errObj.error === 'string' && errObj.error.trim()) {
      return errObj.error;
    }
  }

  return fallbackMessage;
}

/**
 * Centralized dispatcher function to show a Toast notification across the app.
 */
export function showToast(options: ToastOptions | string, type: ToastType = ToastTypeEnum.INFO): void {
  const payload: ToastOptions =
    typeof options === 'string'
      ? { message: options, type }
      : { type: ToastTypeEnum.INFO, ...options };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: payload }));
  }
}

export function showSuccessToast(message: string, actionText?: string, onActionClick?: () => void): void {
  showToast({ message, type: ToastTypeEnum.SUCCESS, actionText, onActionClick });
}

export function showErrorToast(errorOrMessage: unknown, actionText?: string, onActionClick?: () => void): void {
  const message = typeof errorOrMessage === 'string' ? errorOrMessage : extractErrorMessage(errorOrMessage, ERROR_MESSAGES.ACTION_FAILED);
  showToast({ message, type: ToastTypeEnum.ERROR, actionText, onActionClick });
}

export function showInfoToast(message: string, actionText?: string, onActionClick?: () => void): void {
  showToast({ message, type: ToastTypeEnum.INFO, actionText, onActionClick });
}

