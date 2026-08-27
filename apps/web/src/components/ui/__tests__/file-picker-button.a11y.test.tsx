// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { FilePickerButton } from '@/components/ui/file-picker-button';

afterEach(cleanup);

describe('FilePickerButton', () => {
  it('uses a native associated label and replaces the owned input after selection', () => {
    const onFilesSelected = vi.fn();
    const { container } = render(
      <FilePickerButton accept="image/*" onFilesSelected={onFilesSelected}>
        Upload photo
      </FilePickerButton>,
    );

    const label = screen.getByText('Upload photo').closest('label');
    const firstInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(label?.htmlFor).toBe(firstInput.id);
    expect(firstInput.getAttribute('aria-hidden')).toBeNull();

    const file = new File(['image'], 'photo.png', { type: 'image/png' });
    fireEvent.change(firstInput, { target: { files: [file] } });

    expect(onFilesSelected).toHaveBeenCalledWith([file]);
    expect(container.querySelector('input[type="file"]')).not.toBe(firstInput);
  });
});
