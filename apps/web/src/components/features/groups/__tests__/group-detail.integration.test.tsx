// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { GroupDetailView } from '@/components/features/network/GroupDetailView';

vi.mock('@/components/features/home/FeedPostCard', () => ({
  FeedPostCard: ({ authorName, content }: { authorName: string; content: string }) => (
    <article data-testid="shared-feed-post"><h2>{authorName}</h2><p>{content}</p></article>
  ),
}));
vi.mock('@/utils/toast', () => ({ showInfoToast: vi.fn() }));

afterEach(cleanup);

describe('GroupDetailView', () => {
  it('defaults to Posts and renders the shared feed card', () => {
    render(<GroupDetailView />);
    expect(screen.getByRole('heading', { level: 1, name: 'San Jose Sharks' })).toBeTruthy();
    expect(screen.getAllByTestId('shared-feed-post')).toHaveLength(2);
    expect(screen.getByText('KC Blueknocks')).toBeTruthy();
  });

  it.each([
    ['About', 'About San Jose Sharks'],
    ['People', 'Matthew Schaefer'],
    ['Events', '2026 Tim Hortons NHL Heritage Classic'],
    ['Media', 'Youth hockey team celebrating together'],
    ['Files', '2026 Season Schedule.pdf'],
  ])('renders centralized demo data in the %s tab', (tab, expectedContent) => {
    render(<GroupDetailView />);
    fireEvent.click(screen.getByRole('button', { name: tab }));
    if (tab === 'Media') expect(screen.getByAltText(expectedContent)).toBeTruthy();
    else expect(screen.getAllByText(expectedContent).length).toBeGreaterThan(0);
  });
});
