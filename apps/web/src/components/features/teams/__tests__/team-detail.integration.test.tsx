// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TeamDetailView } from '@/components/features/teams/TeamDetailView';

vi.mock('@/components/features/home/FeedPostCard', () => ({
  FeedPostCard: ({ authorName, content }: { authorName: string; content: string }) => (
    <article data-testid="shared-feed-post"><h2>{authorName}</h2><p>{content}</p></article>
  ),
}));
vi.mock('@/components/features/home/WhoToFollowWidget', () => ({
  WhoToFollowWidget: () => <aside data-testid="who-to-follow" />,
}));
vi.mock('@/utils/toast', () => ({ showInfoToast: vi.fn() }));

afterEach(cleanup);

describe('TeamDetailView', () => {
  it('defaults to Posts and renders the shared feed card plus the shared Who to follow widget', () => {
    render(<TeamDetailView />);
    expect(screen.getByRole('heading', { level: 1, name: 'Columbus Blue Jackets' })).toBeTruthy();
    expect(screen.getAllByTestId('shared-feed-post')).toHaveLength(2);
    expect(screen.getByTestId('who-to-follow')).toBeTruthy();
  });

  it('renders a different team name/logo when a specific team row is opened', () => {
    render(<TeamDetailView teamId="team-6" teamName="New York Rangers" teamLogo="/event3.webp" />);
    expect(screen.getByRole('heading', { level: 1, name: 'New York Rangers' })).toBeTruthy();
  });

  it('honors initialTab so a sub-link can open a specific tab directly', () => {
    render(<TeamDetailView initialTab="members" />);
    expect(screen.getByText('Roster')).toBeTruthy();
    expect(screen.getByText('Connor McDavid')).toBeTruthy();
  });

  it.each([
    ['Members', 'Roster'],
    ['Events', '2026 Tim Hortons NHL Heritage Classic'],
    ['Media', 'Player skating with the puck'],
    ['About', 'Columbus, OH, USA'],
  ])('renders centralized demo data in the %s tab', (tab, expectedContent) => {
    render(<TeamDetailView />);
    fireEvent.click(screen.getByRole('button', { name: tab }));
    if (tab === 'Media') expect(screen.getByAltText(expectedContent)).toBeTruthy();
    else expect(screen.getAllByText(expectedContent).length).toBeGreaterThan(0);
  });

  it('calls onBackToTeams when the back button is clicked', () => {
    const onBack = vi.fn();
    render(<TeamDetailView onBackToTeams={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to teams' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
