// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BackButton } from '@/components/common/BackButton';
import { AddPlayerChoiceStep } from '@/components/features/parent/AddPlayerChoiceStep';

afterEach(cleanup);

describe('BackButton', () => {
  it('renders a non-submitting button labelled Back', () => {
    render(<BackButton onClick={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'Back' }) as HTMLButtonElement;
    // `type="button"` matters: these sit inside RHF forms and must not submit.
    expect(button.type).toBe('button');
  });

  it('calls onClick when pressed', () => {
    const onClick = vi.fn();
    render(<BackButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('accepts a custom label and a disabled state', () => {
    render(<BackButton onClick={vi.fn()} label="Go back" disabled />);
    const button = screen.getByRole('button', { name: 'Go back' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

describe('AddPlayerChoiceStep back affordance', () => {
  // Every other mid-flow step in the parent wizard offers a way back; this one
  // did not, stranding a parent who reached it and changed their mind.
  it('offers a back control when the flow supplies one', () => {
    const onBack = vi.fn();
    render(
      <AddPlayerChoiceStep onCreateNew={vi.fn()} onLinkExisting={vi.fn()} onBack={onBack} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('omits the back control when the flow has nowhere to go back to', () => {
    render(<AddPlayerChoiceStep onCreateNew={vi.fn()} onLinkExisting={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
  });

  it('still exposes both choices', () => {
    const onCreateNew = vi.fn();
    const onLinkExisting = vi.fn();
    render(<AddPlayerChoiceStep onCreateNew={onCreateNew} onLinkExisting={onLinkExisting} />);

    fireEvent.click(screen.getByRole('button', { name: /Create a new player profile/ }));
    expect(onCreateNew).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Link an existing player/ }));
    expect(onLinkExisting).toHaveBeenCalledTimes(1);
  });
});
