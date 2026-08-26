// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AuthMeResponse, OtpVerifyResponse } from '@my-hockey-network/contracts';

import { Button } from '@/components/common/Button';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { globalQueryClient } from '@/query';

const { getMe, logout, saveSession, clearSession } = vi.hoisted(() => ({
  getMe: vi.fn(),
  logout: vi.fn(),
  saveSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('@/platform/auth-service', () => ({
  webAuth: { getMe, logout },
}));

vi.mock('@/platform/auth-storage', () => ({
  webAuthStorage: { saveSession, clearSession },
}));

vi.mock('@my-hockey-network/core', () => ({
  getMySupervisionPermissions: vi.fn(),
  getProfile: vi.fn().mockResolvedValue(null),
}));

const parentUser = {
  id: 'parent-1',
  primaryRole: 'PARENT',
  roleAssignments: [{ role: 'PARENT', scopeType: null, scopeId: null }],
  profile: { id: 'profile-1', type: 'PARENT', displayName: 'Parent', avatarUrl: null, isMinor: false },
} as AuthMeResponse;

const session = {
  isNewUser: false,
  onboardingCompleted: true,
  tokenDelivery: 'web',
  expiresInSeconds: 3600,
} as OtpVerifyResponse;

function AuthProbe() {
  const { hasBootstrapped, isAuthenticated, setAuthSession } = useAuth();
  return (
    <div>
      <span>{hasBootstrapped ? 'bootstrapped' : 'loading'}</span>
      <span>{isAuthenticated ? 'authenticated' : 'guest'}</span>
      <Button type="button" onClick={() => setAuthSession(session)}>Set session</Button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  globalQueryClient.clear();
  vi.clearAllMocks();
});

describe('AuthProvider bootstrap', () => {
  it('runs the initial auth bootstrap once without callback dependency re-renders', async () => {
    getMe.mockResolvedValue(parentUser);
    render(<AuthProvider><AuthProbe /></AuthProvider>);

    await screen.findByText('authenticated');
    expect(screen.getByText('bootstrapped')).toBeTruthy();
    expect(getMe).toHaveBeenCalledOnce();
  });

  it('forces auth/me after OTP verification even when the guest bootstrap already completed', async () => {
    getMe.mockResolvedValueOnce(null).mockResolvedValueOnce(parentUser);
    render(<AuthProvider><AuthProbe /></AuthProvider>);

    await screen.findByText('bootstrapped');
    expect(screen.getByText('guest')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Set session' }));

    await waitFor(() => expect(screen.getByText('authenticated')).toBeTruthy());
    expect(getMe).toHaveBeenCalledTimes(2);
    expect(saveSession).toHaveBeenCalledWith(session);
  });
});
