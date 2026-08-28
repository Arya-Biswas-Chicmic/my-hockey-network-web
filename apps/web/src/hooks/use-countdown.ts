'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCountdownOptions {
  /** Seconds the countdown starts from, and the value `restart()` returns to. */
  seconds: number;
  /** Start counting down immediately on mount. Defaults to `true`. */
  autoStart?: boolean;
  /** Called once each time the countdown reaches zero. */
  onComplete?: () => void;
}

export interface UseCountdownResult {
  /** Whole seconds remaining; `0` once finished. */
  remaining: number;
  /** `true` while `remaining > 0`. */
  isActive: boolean;
  /** Restart from `seconds` (or an explicit override). */
  restart: (seconds?: number) => void;
  /** Stop immediately and report `0` remaining. */
  stop: () => void;
}

/**
 * A one-second-resolution countdown timer.
 *
 * Extracted from `VerifyEmailForm`'s inline resend cooldown so any other
 * throttled-retry surface (a second OTP screen, a rate-limited action) can reuse
 * the same behavior instead of re-implementing a `setInterval` in a component.
 *
 * The interval is created once per run rather than once per tick: the previous
 * inline version listed the current count in its effect dependencies, so every
 * decrement tore the timer down and built a new one — 60 teardowns per cooldown,
 * each re-anchoring the next tick to the moment the effect re-ran and letting the
 * countdown drift slower than real time.
 */
export function useCountdown({ seconds, autoStart = true, onComplete }: UseCountdownOptions): UseCountdownResult {
  const [remaining, setRemaining] = useState(() => (autoStart ? seconds : 0));

  // Each call to `restart()` begins a new run. The interval effect keys on this
  // id rather than on `remaining`, so a tick does not tear the timer down and
  // rebuild it — the previous inline implementation did exactly that, 60 times
  // per cooldown, re-anchoring each next tick to the moment the effect re-ran.
  const [runId, setRunId] = useState(0);
  const isRunning = remaining > 0;

  // Held in a ref so a caller passing an inline arrow function does not restart
  // the interval on every render.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      // The updater must stay pure — React may call it more than once per
      // commit — so completion is signalled by the separate effect below rather
      // than from inside here.
      setRemaining((previous) => (previous <= 1 ? 0 : previous - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, runId]);

  // Fires once per run, on the transition to zero. `hasRunRef` keeps a
  // never-started countdown (`autoStart: false`) from reporting completion it
  // never began.
  const hasRunRef = useRef(false);
  useEffect(() => {
    if (isRunning) {
      hasRunRef.current = true;
      return;
    }
    if (hasRunRef.current) {
      hasRunRef.current = false;
      onCompleteRef.current?.();
    }
  }, [isRunning]);

  const restart = useCallback((override?: number) => {
    setRemaining(override ?? seconds);
    setRunId((id) => id + 1);
  }, [seconds]);

  const stop = useCallback(() => setRemaining(0), []);

  return { remaining, isActive: isRunning, restart, stop };
}

/** Formats a second count as `MM:SS`. */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
