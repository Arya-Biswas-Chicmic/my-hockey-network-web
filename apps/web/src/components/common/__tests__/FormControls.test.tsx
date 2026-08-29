// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { Dropdown, Input } from '@/components/common/FormControls';

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

describe('Dropdown', () => {
  it('centers the selected compact-filter label and keeps native selection behavior', () => {
    function CompactDropdownHarness() {
      const [value, setValue] = useState('2025-26');

      return (
        <Dropdown
          id="season-filter"
          value={value}
          options={['2025-26', '2024-25']}
          onChange={setValue}
          variant="compact-centered"
        />
      );
    }

    const { container } = render(<CompactDropdownHarness />);
    const select = container.querySelector('#season-filter') as HTMLSelectElement;
    const display = container.querySelector('.mhn-dropdown-centered-display');

    expect(select.className).toContain('mhn-dropdown-select--compact-centered');
    expect(display?.textContent).toContain('2025-26');

    fireEvent.change(select, { target: { value: '2024-25' } });

    expect(select.value).toBe('2024-25');
    expect(display?.textContent).toContain('2024-25');
  });

  it('matches the shared compact-dropdown Figma geometry', () => {
    const stylesheet = readFileSync(resolve('apps/web/src/index.css'), 'utf8');
    const selectRule = stylesheet.match(
      /\.mhn-dropdown-select--compact-centered\s*\{([^}]*)\}/,
    )?.[1];
    const displayRule = stylesheet.match(
      /\.mhn-dropdown-centered-display\s*\{([^}]*)\}/,
    )?.[1];

    expect(selectRule).toMatch(/height:\s*36px/);
    expect(selectRule).toMatch(/text-align:\s*center/);
    expect(displayRule).toMatch(/justify-content:\s*center/);
    expect(displayRule).toMatch(/gap:\s*8px/);
    expect(displayRule).toMatch(/font-size:\s*14px/);
    expect(displayRule).toMatch(/font-weight:\s*400/);
    expect(displayRule).toMatch(/line-height:\s*20px/);
  });
});
