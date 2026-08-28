// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { VerifyEmailForm } from '@/components/features/auth/verify-email/VerifyEmailForm';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function confirmButton() {
  return screen.getByRole('button', { name: /confirm/i }) as HTMLButtonElement;
}

describe('VerifyEmailForm', () => {
  it('keeps Confirm disabled until all six digits are entered', () => {
    render(<VerifyEmailForm email="player@example.com" prefillCode={null} />);

    expect(confirmButton().disabled).toBe(true);

    const inputs = screen.getAllByRole('textbox');
    act(() => {
      inputs.slice(0, 5).forEach((input, index) => {
        fireEvent.change(input, { target: { value: String(index + 1) } });
      });
    });
    expect(confirmButton().disabled).toBe(true);

    act(() => {
      fireEvent.change(inputs[5], { target: { value: '6' } });
    });
    expect(confirmButton().disabled).toBe(false);
  });

  it('submits the entered code', async () => {
    const onConfirm = vi.fn();
    render(<VerifyEmailForm onConfirm={onConfirm} prefillCode="123456" />);

    expect(confirmButton().disabled).toBe(false);
    fireEvent.click(confirmButton());

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith('123456'));
  });

  it('announces the resend notice and the error to assistive technology', () => {
    const { rerender } = render(<VerifyEmailForm resendNotice="A new code was sent" />);
    expect(screen.getByRole('status').textContent).toContain('A new code was sent');

    rerender(<VerifyEmailForm errorMessage="That code is not valid." />);
    expect(screen.getByRole('alert').textContent).toContain('That code is not valid.');
  });

  it('restarts the cooldown after a resend that reports success', async () => {
    vi.useFakeTimers();
    const onResendCode = vi.fn().mockResolvedValue(true);
    render(<VerifyEmailForm onResendCode={onResendCode} />);

    // Run the initial cooldown out so the action becomes pressable.
    act(() => {
      vi.advanceTimersByTime(59_000);
    });
    const resend = screen.getByRole('button', { name: /resend code/i });

    await act(async () => {
      resend.click();
    });

    expect(onResendCode).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('timer').textContent).toContain('00:59');
  });

  // A failed resend must leave the button pressable rather than imposing a full
  // cooldown for a code that was never sent.
  it('does not restart the cooldown when the resend reports failure', async () => {
    vi.useFakeTimers();
    const onResendCode = vi.fn().mockResolvedValue(false);
    render(<VerifyEmailForm onResendCode={onResendCode} />);

    act(() => {
      vi.advanceTimersByTime(59_000);
    });

    await act(async () => {
      screen.getByRole('button', { name: /resend code/i }).click();
    });

    expect(screen.queryByRole('timer')).toBeNull();
    expect(screen.getByRole('button', { name: /resend code/i })).toBeTruthy();
  });

  it('clears the resend notice when the cooldown ends', () => {
    vi.useFakeTimers();
    const onResendNoticeExpire = vi.fn();
    render(<VerifyEmailForm resendNotice="A new code was sent" onResendNoticeExpire={onResendNoticeExpire} />);

    expect(onResendNoticeExpire).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(59_000);
    });

    expect(onResendNoticeExpire).toHaveBeenCalledTimes(1);
  });
});
