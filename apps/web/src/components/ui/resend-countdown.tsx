'use client';

import React from 'react';
import { Button } from '@/components/common/Button';
import { formatCountdown, useCountdown } from '@/hooks/use-countdown';

export interface ResendCountdownProps {
  /** Cooldown length in seconds. */
  seconds: number;
  /** Invoked when the user presses the action while the countdown is finished. */
  onResend: () => void;
  /** Disables the action independently of the countdown (e.g. a request in flight). */
  disabled?: boolean;
  /** Action label once the countdown finishes. */
  actionLabel?: string;
  /** Text shown before the remaining time while counting down. */
  waitingLabel?: string;
  /** Remaining seconds at or below which the timer switches to its urgent style. */
  urgentThreshold?: number;
  /** Called when the cooldown reaches zero — e.g. to clear a "code sent" notice. */
  onCountdownComplete?: () => void;
  className?: string;
}

export interface ResendCountdownHandle {
  /** Begin a fresh cooldown. Call this only after a resend actually succeeds. */
  restart: (seconds?: number) => void;
}

/**
 * A cooldown-gated "resend" control: renders a live `MM:SS` countdown while the
 * cooldown is running, then swaps to a pressable action button.
 *
 * The cooldown is *not* restarted automatically when the action fires. The owner
 * restarts it through the imperative handle once the underlying request has
 * actually succeeded — otherwise a failed resend would still lock the user out
 * for a full cooldown with no new code on the way, which is what the previous
 * inline implementation in `VerifyEmailForm` did.
 */
export const ResendCountdown = React.forwardRef<ResendCountdownHandle, ResendCountdownProps>(function ResendCountdown(
  {
    seconds,
    onResend,
    disabled = false,
    actionLabel = 'Resend Code',
    waitingLabel = 'Resend Code in',
    urgentThreshold = 10,
    onCountdownComplete,
    className,
  },
  ref,
) {
  const { remaining, isActive, restart } = useCountdown({ seconds, onComplete: onCountdownComplete });

  React.useImperativeHandle(ref, () => ({ restart }), [restart]);

  if (isActive) {
    const isUrgent = remaining <= urgentThreshold;
    return (
      <span
        className={isUrgent ? 'mhn-timer-text-urgent' : 'mhn-timer-text'}
        // Announced politely so a screen reader user is told when the wait ends,
        // without the every-second chatter an assertive live region would cause.
        role="timer"
        aria-live="off"
      >
        {waitingLabel} {formatCountdown(remaining)}
      </span>
    );
  }

  return (
    <Button
      type="button"
      onClick={onResend}
      disabled={disabled}
      className={className ?? 'auth-primary-link btn-resend-code mhn-btn-resend-link'}
    >
      {actionLabel}
    </Button>
  );
});
