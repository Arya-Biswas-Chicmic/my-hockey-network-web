// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { OtpCodeInput } from '@/components/common/OtpCodeInput';

afterEach(cleanup);

function digitInput(n: number) {
  return screen.getByLabelText(`Verification code digit ${n}`) as HTMLInputElement;
}

describe('OtpCodeInput keyboard behavior', () => {
  it('exposes one labeled, focusable input per digit', () => {
    render(<OtpCodeInput value="" onChange={vi.fn()} />);
    for (let i = 1; i <= 6; i++) {
      expect(digitInput(i).getAttribute('aria-label')).toBe(`Verification code digit ${i}`);
    }
  });

  it('advances focus to the next digit as each digit is typed', () => {
    const onChange = vi.fn();
    render(<OtpCodeInput value="1" onChange={onChange} />);
    fireEvent.change(digitInput(2), { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith('12');
    expect(document.activeElement).toBe(digitInput(3));
  });

  it('moves focus back to the previous digit on Backspace from an empty field', () => {
    render(<OtpCodeInput value="12" onChange={vi.fn()} />);
    digitInput(3).focus();
    expect(document.activeElement).toBe(digitInput(3));
    fireEvent.keyDown(digitInput(3), { key: 'Backspace' });
    expect(document.activeElement).toBe(digitInput(2));
  });

  it('does not move focus on Backspace when the current field already has a digit (native deletion handles it)', () => {
    render(<OtpCodeInput value="123" onChange={vi.fn()} />);
    digitInput(3).focus();
    fireEvent.keyDown(digitInput(3), { key: 'Backspace' });
    expect(document.activeElement).toBe(digitInput(3));
  });

  it('does not move focus on Backspace from the first field (nothing before it)', () => {
    render(<OtpCodeInput value="" onChange={vi.fn()} />);
    digitInput(1).focus();
    fireEvent.keyDown(digitInput(1), { key: 'Backspace' });
    expect(document.activeElement).toBe(digitInput(1));
  });

  it('allows Tab/ArrowLeft/ArrowRight/Delete/Enter and modified keys through without blocking them', () => {
    render(<OtpCodeInput value="" onChange={vi.fn()} />);
    const input = digitInput(1);
    for (const key of ['Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      const prevented = !input.dispatchEvent(event);
      expect(prevented).toBe(false);
    }
  });

  it('blocks a non-digit character key from being entered', () => {
    render(<OtpCodeInput value="" onChange={vi.fn()} />);
    const input = digitInput(1);
    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    const prevented = !input.dispatchEvent(event);
    expect(prevented).toBe(true);
  });

  it('allows a digit character key through', () => {
    render(<OtpCodeInput value="" onChange={vi.fn()} />);
    const input = digitInput(1);
    const event = new KeyboardEvent('keydown', { key: '5', bubbles: true, cancelable: true });
    const prevented = !input.dispatchEvent(event);
    expect(prevented).toBe(false);
  });

  it('calls onComplete once the final digit fills the last field', () => {
    const onComplete = vi.fn();
    render(<OtpCodeInput value="12345" onChange={vi.fn()} onComplete={onComplete} />);
    fireEvent.change(digitInput(6), { target: { value: '6' } });
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('focuses the first empty digit when an external error is set (e.g. server rejected the code)', () => {
    const { rerender } = render(<OtpCodeInput value="123" onChange={vi.fn()} error={null} />);
    rerender(<OtpCodeInput value="123" onChange={vi.fn()} error="Invalid code." />);
    expect(document.activeElement).toBe(digitInput(4));
  });
});
