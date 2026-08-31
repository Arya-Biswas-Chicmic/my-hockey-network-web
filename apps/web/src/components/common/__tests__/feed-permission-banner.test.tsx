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
  reason?: string;
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

describe('actionable blocks only', () => {
  // A parent-disabled control is explained where the blocked content would be
  // (`PermissionCard` / `PermissionNotice`), so repeating it here put the same
  // sentence on screen twice. The domain marks exactly these blocks by giving
  // them no ctaAction.
  it('stays silent for a block the user cannot act on', () => {
    mockPermissions({
      reason: 'SUPERVISION_CONTROL_RESTRICTED',
      message: 'Your parent/guardian has disabled viewing feed posts.',
      ctaText: null,
      ctaAction: null,
    });
    const { container } = render(<FeedPermissionBanner onNavigate={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it.each([
    ['UNAUTHENTICATED', 'Please sign in to interact with posts.', 'Sign In', 'LOGIN' as const],
    ['PROFILE_INCOMPLETE', 'Please complete your profile.', 'Complete Profile', 'COMPLETE_PROFILE' as const],
    ['GUARDIAN_APPROVAL_REQUIRED', 'Waiting for guardian approval.', 'Check Approval', 'GUARDIAN_APPROVAL' as const],
  ])('still shows %s, which the user can act on', (reason, message, ctaText, ctaAction) => {
    mockPermissions({ reason, message, ctaText, ctaAction });
    render(<FeedPermissionBanner onNavigate={vi.fn()} />);

    expect(screen.getByText(message)).toBeTruthy();
    expect(screen.getByText(ctaText)).toBeTruthy();
  });
});
