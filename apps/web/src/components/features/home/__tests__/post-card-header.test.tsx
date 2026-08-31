// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { PostCardHeader } from '@/components/features/home/PostCardHeader';

afterEach(cleanup);

describe('PostCardHeader', () => {
  it('keeps the author name and subtitle in one shared metadata column', () => {
    const { container } = render(
      <PostCardHeader
        authorName="KC Blueknocks"
        authorRole="Official Team"
        authorTime="1d"
        authorAvatar="/KCBluenocks.webp"
        isSelf={false}
        canFollow
        isFollowing={false}
        isFollowingLoading={false}
        onToggleFollow={vi.fn()}
        onAuthorClick={vi.fn()}
        isMenuOpen={false}
        onToggleMenu={vi.fn()}
      />,
    );

    const authorButton = screen.getByRole('button', {
      name: "View KC Blueknocks's profile",
    });
    const metadata = container.querySelector('.mhn-author-meta');

    expect(authorButton.contains(metadata)).toBe(true);
    expect(metadata?.querySelector('.mhn-author-name')?.textContent).toBe(
      'KC Blueknocks',
    );
    expect(metadata?.querySelector('.mhn-author-subtitle')?.textContent).toBe(
      'Official Team • 1d',
    );
  });

  it('overrides common button centering with the Figma left-alignment contract', () => {
    const stylesheet = readFileSync(resolve('apps/web/src/index.css'), 'utf8');
    const authorGroupRule = stylesheet.match(
      /\.mhn-post-author-group\s*\{([^}]*)\}/,
    )?.[1];
    const metadataRule = stylesheet.match(
      /\.mhn-author-meta\s*\{([^}]*)\}/,
    )?.[1];

    expect(authorGroupRule).toMatch(/justify-content:\s*flex-start/);
    expect(authorGroupRule).toMatch(/text-align:\s*left/);
    expect(metadataRule).toMatch(/align-items:\s*flex-start/);
    expect(metadataRule).toMatch(/text-align:\s*left/);
    expect(metadataRule).toMatch(/padding:\s*4px 4px 4px 8px/);
  });
});
