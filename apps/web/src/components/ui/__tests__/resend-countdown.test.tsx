// @vitest-environment jsdom
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { ResendCountdown, type ResendCountdownHandle } from '@/components/ui/resend-countdown';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function tick(seconds: number) {
  act(() => {
    vi.advanceTimersByTime(seconds * 1000);
  });
}

describe('ResendCountdown', () => {
  it('shows the remaining time while counting down, with no pressable action', () => {
    vi.useFakeTimers();
    render(<ResendCountdown seconds={59} onResend={vi.fn()} />);

    expect(screen.getByRole('timer').textContent).toContain('Resend Code in 00:59');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('swaps to the action button once the countdown finishes', () => {
    vi.useFakeTimers();
    render(<ResendCountdown seconds={2} onResend={vi.fn()} />);

    tick(2);

    expect(screen.queryByRole('timer')).toBeNull();
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByRole('button').textContent).toContain('Resend Code');
  });

  it('calls onResend when the action is pressed', () => {
    vi.useFakeTimers();
    const onResend = vi.fn();
    render(<ResendCountdown seconds={1} onResend={onResend} />);

    tick(1);
    act(() => {
      screen.getByRole('button').click();
    });

    expect(onResend).toHaveBeenCalledTimes(1);
  });

  // The cooldown must not restart on its own: the owner restarts it through the
  // handle only after the resend request actually succeeds.
  it('stays pressable after the action fires until the owner restarts it', () => {
    vi.useFakeTimers();
    const ref = createRef<ResendCountdownHandle>();
    render(<ResendCountdown ref={ref} seconds={5} onResend={vi.fn()} />);

    tick(5);
    act(() => {
      screen.getByRole('button').click();
    });
    expect(screen.queryByRole('button')).not.toBeNull();

    act(() => ref.current?.restart());
    expect(screen.getByRole('timer').textContent).toContain('00:05');
  });

  it('marks the last seconds with the urgent style', () => {
    vi.useFakeTimers();
    render(<ResendCountdown seconds={12} onResend={vi.fn()} urgentThreshold={10} />);

    expect(screen.getByRole('timer').className).toContain('mhn-timer-text');
    expect(screen.getByRole('timer').className).not.toContain('urgent');

    tick(2);
    expect(screen.getByRole('timer').className).toContain('mhn-timer-text-urgent');
  });

  it('honours the disabled prop on the action', () => {
    vi.useFakeTimers();
    render(<ResendCountdown seconds={1} onResend={vi.fn()} disabled />);

    tick(1);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('accepts custom labels', () => {
    vi.useFakeTimers();
    render(<ResendCountdown seconds={1} onResend={vi.fn()} waitingLabel="Try again in" actionLabel="Send again" />);

    expect(screen.getByRole('timer').textContent).toContain('Try again in 00:01');
    tick(1);
    expect(screen.getByRole('button').textContent).toContain('Send again');
  });
});
