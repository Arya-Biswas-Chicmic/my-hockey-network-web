// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { EventDetailPage } from '@/screens/event-detail-page';

vi.mock('@/utils/toast', () => ({ showInfoToast: vi.fn(), showSuccessToast: vi.fn() }));

afterEach(cleanup);

describe('EventDetailPage', () => {
  it('opens the Figma organiser list and supports search and follow state', () => {
    render(<EventDetailPage />);

    fireEvent.click(screen.getByRole('button', { name: 'View All' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Event Organiser & Attendant' })).toBeTruthy();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'Emily' } });
    expect(screen.getByText('Emily Johnson')).toBeTruthy();
    expect(screen.queryByText('Connor McDavid')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Follow' }));
    expect(screen.getByRole('button', { name: 'Following' })).toBeTruthy();
  });

  it('toggles the primary event actions', () => {
    render(<EventDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(screen.getByRole('button', { name: 'Registered' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Interested' }));
    expect(screen.getByRole('button', { name: 'Interested' }).className).toContain('border-primary');
  });
});
