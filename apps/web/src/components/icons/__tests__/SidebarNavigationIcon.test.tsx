// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SidebarNavigationIcon } from '@/components/icons/SidebarNavigationIcon';

afterEach(cleanup);

describe('SidebarNavigationIcon', () => {
  it('switches between the exact inactive and active Figma assets', () => {
    const { container, rerender } = render(
      <SidebarNavigationIcon name="home" active={false} />,
    );

    expect(container.querySelector('.mhn-sidebar-nav-icon--home-inactive')).not.toBeNull();

    rerender(<SidebarNavigationIcon name="home" active />);

    expect(container.querySelector('.mhn-sidebar-nav-icon--home-active')).not.toBeNull();
  });

  it('keeps the icon decorative and exposes a theme-owned mask class', () => {
    const { container } = render(<SidebarNavigationIcon name="profile" active={false} />);
    const icon = container.querySelector('.mhn-sidebar-nav-icon');

    expect(icon?.classList.contains('mhn-sidebar-nav-icon--profile-inactive')).toBe(true);
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });
});
