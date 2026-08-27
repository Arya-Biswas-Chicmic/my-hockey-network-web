// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { Input } from '@/components/common/FormControls';

afterEach(cleanup);

describe('Input', () => {
  it('reports a sanitized email value without mutating the browser event', () => {
    const onValueChange = vi.fn();
    render(<Input aria-label="Email" type="email" onValueChange={onValueChange} />);

    const input = screen.getByLabelText('Email') as HTMLInputElement;
    fireEvent.change(input, { target: { value: ' User +tag@Example.COM ' } });

    // The DOM retains the browser-provided value (including the internal
    // space), while consumers receive the separately sanitized value.
    expect(input.value).toBe('User +tag@Example.COM');
    expect(onValueChange).toHaveBeenCalledWith('User+tag@Example.COM', expect.anything());
  });

  it('reports a normalized name on blur without creating a change event', () => {
    const onValueChange = vi.fn();
    render(
      <Input
        aria-label="Full name"
        isNameInput
        defaultValue="  Alex   Morgan  "
        onValueChange={onValueChange}
      />,
    );

    fireEvent.blur(screen.getByLabelText('Full name'));
    expect(onValueChange).toHaveBeenCalledWith('Alex Morgan', expect.anything());
  });
});
