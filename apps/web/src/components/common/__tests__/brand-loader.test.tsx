// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { BrandLoader } from '@/components/common/BrandLoader';

afterEach(cleanup);

describe('BrandLoader', () => {
  it('announces itself as a polite live status region', () => {
    render(<BrandLoader />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.getAttribute('aria-label')).toBe('Loading My Hockey Network');
  });

  it('accepts a custom label', () => {
    render(<BrandLoader label="Checking your session" />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Checking your session');
  });

  it('renders the brand mark with an empty alt so it is not read twice', () => {
    const { container } = render(<BrandLoader />);
    const logo = container.querySelector('img');
    expect(logo).not.toBeNull();
    // The wrapper already carries the accessible name via aria-label.
    expect(logo?.getAttribute('alt')).toBe('');
  });

  it('only fills the viewport when asked', () => {
    const { container, rerender } = render(<BrandLoader />);
    expect(container.querySelector('.mhn-brand-loader--full')).toBeNull();

    rerender(<BrandLoader fullScreen />);
    expect(container.querySelector('.mhn-brand-loader--full')).not.toBeNull();
  });

  it('hides the decorative progress track from assistive technology', () => {
    const { container } = render(<BrandLoader />);
    const track = container.querySelector('.mhn-brand-loader-track');
    expect(track?.getAttribute('aria-hidden')).toBe('true');
  });
});
