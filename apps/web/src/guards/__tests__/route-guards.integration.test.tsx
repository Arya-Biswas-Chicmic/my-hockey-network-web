// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockUseAuth = vi.fn();
vi.mock('../../hooks/use-auth', () => ({ useAuth: () => mockUseAuth() }));

import { AuthGuard } from '@/guards/auth-guard';
import { RoleGuard } from '@/guards/role-guard';

afterEach(() => {
  cleanup();
  mockUseAuth.mockReset();
});

describe('web route guards', () => {
  it('redirects an unauthenticated direct URL only after bootstrap', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      hasBootstrapped: true,
      user: null,
    });
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route element={<AuthGuard />}>
            <Route path="/profile" element={<div>Private profile</div>} />
          </Route>
          <Route path="/onboarding" element={<div>Onboarding</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Onboarding')).toBeTruthy();
    expect(screen.queryByText('Private profile')).toBeNull();
  });

  it('redirects a non-parent from supervision and emits one informational toast', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      hasBootstrapped: true,
      user: { primaryRole: 'PLAYER' },
    });
    const toastListener = vi.fn();
    window.addEventListener('mhn:toast', toastListener);
    render(
      <MemoryRouter initialEntries={['/supervision']}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={['PARENT']} />}>
            <Route path="/supervision" element={<div>Supervision</div>} />
          </Route>
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Home')).toBeTruthy();
    await waitFor(() => expect(toastListener).toHaveBeenCalledTimes(1));
    window.removeEventListener('mhn:toast', toastListener);
  });
});
