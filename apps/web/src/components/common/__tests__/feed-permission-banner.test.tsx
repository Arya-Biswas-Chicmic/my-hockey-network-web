// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { FeedCtaAction } from '@my-hockey-network/domain';
import { FeedPermissionBanner } from '@/components/common/FeedPermissionBanner';

const useFeedPermissionsMock = vi.fn();
vi.mock('@/hooks/use-feed-permissions', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/use-feed-permissions')>(
    '@/hooks/use-feed-permissions',
  );
  return {
    // The real `resolveFeedPermissionCta` is kept: it is the routing logic
    // under test, and mocking it would defeat the point of these assertions.
    resolveFeedPermissionCta: actual.resolveFeedPermissionCta,
    useFeedPermissions: (...args: unknown[]) => useFeedPermissionsMock(...args),
  };
});

function mockPermissions(overrides: {
  allowed?: boolean;
  message?: string | null;
  ctaText?: string | null;
  ctaAction?: FeedCtaAction;
}) {
  useFeedPermissionsMock.mockReturnValue({
    permissions: {
      allowed: false,
      reason: 'GUARDIAN_PENDING',
      message: 'Guardian invitation pending.',
      ctaText: 'Manage Invitations',
      ctaAction: 'GUARDIAN_APPROVAL',
      ...overrides,
    },
  });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('FeedPermissionBanner', () => {
  it('renders nothing when the user is allowed', () => {
    mockPermissions({ allowed: true });
    const { container } = render(<FeedPermissionBanner onNavigate={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when there is no message to show', () => {
    mockPermissions({ allowed: false, message: null });
    const { container } = render(<FeedPermissionBanner onNavigate={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the permission message and its CTA label', () => {
    mockPermissions({});
    render(<FeedPermissionBanner onNavigate={vi.fn()} />);
    expect(screen.getByText('Guardian invitation pending.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Manage Invitations' })).toBeTruthy();
  });

  it('falls back to a default CTA label when the permission supplies none', () => {
    mockPermissions({ ctaText: null });
    render(<FeedPermissionBanner onNavigate={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Complete Profile' })).toBeTruthy();
  });

  it.each([
    ['GUARDIAN_APPROVAL' as const, 'supervision'],
    ['COMPLETE_PROFILE' as const, 'profile'],
    ['LOGIN' as const, 'login'],
  ])('routes the %s CTA to %s', (ctaAction, expected) => {
    mockPermissions({ ctaAction });
    const onNavigate = vi.fn();
    render(<FeedPermissionBanner onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onNavigate).toHaveBeenCalledWith(expected);
  });

  // Profile satisfies COMPLETE_PROFILE in place rather than navigating to itself.
  it('prefers onCompleteProfile over navigation for the COMPLETE_PROFILE action', () => {
    mockPermissions({ ctaAction: 'COMPLETE_PROFILE' });
    const onNavigate = vi.fn();
    const onCompleteProfile = vi.fn();
    render(
      <FeedPermissionBanner onNavigate={onNavigate} onCompleteProfile={onCompleteProfile} />,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onCompleteProfile).toHaveBeenCalledTimes(1);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('does not divert other CTA actions to onCompleteProfile', () => {
    mockPermissions({ ctaAction: 'GUARDIAN_APPROVAL' });
    const onNavigate = vi.fn();
    const onCompleteProfile = vi.fn();
    render(
      <FeedPermissionBanner onNavigate={onNavigate} onCompleteProfile={onCompleteProfile} />,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onCompleteProfile).not.toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalledWith('supervision');
  });
});
