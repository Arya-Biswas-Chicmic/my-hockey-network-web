// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { formatCountdown, useCountdown } from '@/hooks/use-countdown';

afterEach(() => {
  vi.useRealTimers();
});

/** Advances fake timers by whole seconds inside `act`. */
function tick(seconds: number) {
  act(() => {
    vi.advanceTimersByTime(seconds * 1000);
  });
}

describe('useCountdown', () => {
  it('counts down one second at a time and reports when it is finished', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCountdown({ seconds: 3 }));

    expect(result.current.remaining).toBe(3);
    expect(result.current.isActive).toBe(true);

    tick(1);
    expect(result.current.remaining).toBe(2);

    tick(2);
    expect(result.current.remaining).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it('stops at zero rather than going negative', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCountdown({ seconds: 2 }));

    tick(10);
    expect(result.current.remaining).toBe(0);
  });

  it('keeps real time across a full run instead of drifting', () => {
    // Regression guard for the previous inline implementation, whose effect
    // listed the current count as a dependency: every tick tore the interval
    // down and re-anchored the next one, so the countdown ran slower than the
    // wall clock. 30 seconds of timers must consume exactly 30 counts.
    vi.useFakeTimers();
    const { result } = renderHook(() => useCountdown({ seconds: 59 }));

    tick(30);
    expect(result.current.remaining).toBe(29);
  });

  it('fires onComplete exactly once', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    renderHook(() => useCountdown({ seconds: 2, onComplete }));

    tick(5);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not start when autoStart is false', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCountdown({ seconds: 5, autoStart: false }));

    expect(result.current.isActive).toBe(false);
    tick(3);
    expect(result.current.remaining).toBe(0);
  });

  it('restarts from the configured duration, or an explicit override', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCountdown({ seconds: 5 }));

    tick(5);
    expect(result.current.isActive).toBe(false);

    act(() => result.current.restart());
    expect(result.current.remaining).toBe(5);

    act(() => result.current.restart(2));
    expect(result.current.remaining).toBe(2);
    tick(2);
    expect(result.current.isActive).toBe(false);
  });

  it('restarts cleanly mid-run without leaving the old interval running', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCountdown({ seconds: 10 }));

    tick(3);
    expect(result.current.remaining).toBe(7);

    act(() => result.current.restart());
    expect(result.current.remaining).toBe(10);

    // A single stale interval would double-decrement here.
    tick(1);
    expect(result.current.remaining).toBe(9);
  });

  it('stop() ends the run immediately', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCountdown({ seconds: 30 }));

    act(() => result.current.stop());
    expect(result.current.remaining).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it('clears its interval on unmount', () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() => useCountdown({ seconds: 30 }));

    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});

describe('formatCountdown', () => {
  it('formats seconds as MM:SS', () => {
    expect(formatCountdown(59)).toBe('00:59');
    expect(formatCountdown(9)).toBe('00:09');
    expect(formatCountdown(0)).toBe('00:00');
    expect(formatCountdown(60)).toBe('01:00');
    expect(formatCountdown(125)).toBe('02:05');
  });

  it('clamps negatives to zero', () => {
    expect(formatCountdown(-5)).toBe('00:00');
  });
});
