// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

import { AuthenticatedGuard } from '@/components/routing/authenticated-guard';
import { GuestGuard } from '@/components/routing/guest-guard';
import { ParentRoleGuard } from '@/components/routing/parent-role-guard';
import { MinorPlayerGuard } from '@/components/routing/minor-player-guard';

const replace = vi.fn();
const useAuthMock = vi.fn();
const useSearchParamsMock = vi.fn(() => new URLSearchParams());

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/home',
  useSearchParams: () => useSearchParamsMock(),
}));

afterEach(() => {
  cleanup();
  replace.mockClear();
  useAuthMock.mockReset();
  useSearchParamsMock.mockReturnValue(new URLSearchParams());
});

describe('AuthenticatedGuard', () => {
  it('fails closed (renders no protected content) while the auth bootstrap is still in flight', () => {
    useAuthMock.mockReturnValue({ hasBootstrapped: false, isAuthenticated: false });
    render(
      <AuthenticatedGuard>
        <div>Protected content</div>
      </AuthenticatedGuard>,
    );
    expect(screen.queryByText('Protected content')).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects to onboarding with a returnTo once bootstrapped and unauthenticated (covers session expiry)', async () => {
    useAuthMock.mockReturnValue({ hasBootstrapped: true, isAuthenticated: false });
    render(
      <AuthenticatedGuard>
        <div>Protected content</div>
      </AuthenticatedGuard>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/onboarding?returnTo=%2Fhome'));
    expect(screen.queryByText('Protected content')).toBeNull();
  });

  it('renders protected content once bootstrapped and authenticated', () => {
    useAuthMock.mockReturnValue({ hasBootstrapped: true, isAuthenticated: true });
    render(
      <AuthenticatedGuard>
        <div>Protected content</div>
      </AuthenticatedGuard>,
    );
    expect(screen.getByText('Protected content')).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });
});

describe('GuestGuard', () => {
  it('fails closed while the auth bootstrap is still in flight', () => {
    useAuthMock.mockReturnValue({ hasBootstrapped: false, isAuthenticated: false });
    render(
      <GuestGuard>
        <div>Guest content</div>
      </GuestGuard>,
    );
    expect(screen.queryByText('Guest content')).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects an already-authenticated visitor away from the guest-only route', async () => {
    useAuthMock.mockReturnValue({ hasBootstrapped: true, isAuthenticated: true });
    render(
      <GuestGuard>
        <div>Guest content</div>
      </GuestGuard>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/home'));
  });

  it('honors a same-origin returnTo query param instead of the default home path', async () => {
    useAuthMock.mockReturnValue({ hasBootstrapped: true, isAuthenticated: true });
    useSearchParamsMock.mockReturnValue(new URLSearchParams('returnTo=/players/42'));
    render(
      <GuestGuard>
        <div>Guest content</div>
      </GuestGuard>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/players/42'));
  });

  it('renders guest content when bootstrapped and unauthenticated', () => {
    useAuthMock.mockReturnValue({ hasBootstrapped: true, isAuthenticated: false });
    render(
      <GuestGuard>
        <div>Guest content</div>
      </GuestGuard>,
    );
    expect(screen.getByText('Guest content')).toBeTruthy();
  });

  // While the bootstrap is in flight the layout is genuinely unknown, so the
  // brand loader shows rather than any route-shaped skeleton.
  it('shows the brand loader while bootstrapping', () => {
    useAuthMock.mockReturnValue({ hasBootstrapped: false, isAuthenticated: false });
    const { container } = render(
      <GuestGuard>
        <div>Guest content</div>
      </GuestGuard>,
    );
    expect(container.querySelector('.mhn-brand-loader')).not.toBeNull();
    expect(container.querySelector('.mhn-app-shell')).toBeNull();
  });

  // Regression guard: this used to render `FullAppSkeletonLoader`, so a visitor
  // on a guest route saw the authenticated sidebar and feed rather than the
  // centered onboarding shell.
  it('shows the auth placeholder, not the authenticated app shell, once bootstrapped', () => {
    useAuthMock.mockReturnValue({ hasBootstrapped: true, isAuthenticated: true });
    const { container } = render(
      <GuestGuard>
        <div>Guest content</div>
      </GuestGuard>,
    );
    expect(container.querySelector('.onboarding-screen')).not.toBeNull();
    expect(container.querySelector('.mhn-app-shell')).toBeNull();
    expect(container.querySelector('.mhn-sidebar')).toBeNull();
  });
});

describe('ParentRoleGuard', () => {
  it('fails closed and redirects home for a signed-in user without the PARENT role', async () => {
    useAuthMock.mockReturnValue({ user: { id: '1', primaryRole: 'PLAYER' } });
    render(
      <ParentRoleGuard>
        <div>Parent-only content</div>
      </ParentRoleGuard>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/home'));
    expect(screen.queryByText('Parent-only content')).toBeNull();
  });

  it('recognizes a PARENT role granted only via roleAssignments', () => {
    useAuthMock.mockReturnValue({
      user: { id: '1', primaryRole: 'PLAYER', roleAssignments: [{ role: 'PARENT' }] },
    });
    render(
      <ParentRoleGuard>
        <div>Parent-only content</div>
      </ParentRoleGuard>,
    );
    expect(screen.getByText('Parent-only content')).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });
});

describe('MinorPlayerGuard', () => {
  it('renders the child-facing route only for a minor player', () => {
    useAuthMock.mockReturnValue({
      user: {
        id: '1',
        primaryRole: 'PLAYER',
        roleAssignments: [],
        profile: { type: 'PLAYER', isMinor: true },
      },
    });
    render(
      <MinorPlayerGuard>
        <div>Minor guardian invites</div>
      </MinorPlayerGuard>,
    );
    expect(screen.getByText('Minor guardian invites')).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects an adult player away from the child-facing route', async () => {
    useAuthMock.mockReturnValue({
      user: {
        id: '1',
        primaryRole: 'PLAYER',
        roleAssignments: [],
        profile: { type: 'PLAYER', isMinor: false },
      },
    });
    render(
      <MinorPlayerGuard>
        <div>Minor guardian invites</div>
      </MinorPlayerGuard>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/profile'));
    expect(screen.queryByText('Minor guardian invites')).toBeNull();
  });

  it('redirects a parent even when their profile data contains a minor-shaped flag', async () => {
    useAuthMock.mockReturnValue({
      user: {
        id: '1',
        primaryRole: 'PARENT',
        roleAssignments: [{ role: 'PARENT' }],
        profile: { type: 'PARENT', isMinor: true },
      },
    });
    render(
      <MinorPlayerGuard>
        <div>Minor guardian invites</div>
      </MinorPlayerGuard>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/profile'));
  });
});
