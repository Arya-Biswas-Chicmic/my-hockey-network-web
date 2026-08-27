// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { AddPlayerChoiceStep } from '@/components/features/parent/AddPlayerChoiceStep';
import {
  CreatePlayerProtectStep,
  type PlayerProtectFormData,
} from '@/components/features/parent/CreatePlayerProtectStep';
import { PlayerAddedSuccessStep } from '@/components/features/parent/PlayerAddedSuccessStep';
import { RoleOptionCard } from '@/components/features/onboarding/RoleOptionCard';

afterEach(cleanup);

const protectionDefaults: PlayerProtectFormData = {
  profileVisibility: 'CONNECTIONS',
  requireApprovalAdultContact: true,
  requireApprovalConnections: true,
  requireApprovalTeamInvites: true,
  requireApprovalMedia: true,
};

describe('Figma onboarding interaction flow', () => {
  it('exposes role cards as an accessible radio control', () => {
    const onSelect = vi.fn();
    render(
      <RoleOptionCard
        role={{
          id: 'PLAYER',
          title: 'Player',
          description: 'I play hockey',
          icon: '/player.svg',
        }}
        isSelected
        onSelect={onSelect}
      />,
    );

    const role = screen.getByRole('radio', { name: /player/i });
    expect(role.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(role);
    expect(onSelect).toHaveBeenCalledWith('PLAYER');
  });

  it('routes each add-player choice through its component event handler', () => {
    const onCreateNew = vi.fn();
    const onLinkExisting = vi.fn();
    render(
      <AddPlayerChoiceStep
        onCreateNew={onCreateNew}
        onLinkExisting={onLinkExisting}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /create a new player profile/i }));
    fireEvent.click(screen.getByRole('button', { name: /link an existing player/i }));

    expect(onCreateNew).toHaveBeenCalledOnce();
    expect(onLinkExisting).toHaveBeenCalledOnce();
  });

  it('reports visibility and supervision changes without mutating form data', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const onBack = vi.fn();
    const formData = { ...protectionDefaults };
    render(
      <CreatePlayerProtectStep
        playerNameFirst="Avery"
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
        onBack={onBack}
        loading={false}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /hockey network/i }));
    fireEvent.click(screen.getByRole('switch', { name: 'Connections' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create Player Profile' }));

    expect(onChange).toHaveBeenNthCalledWith(1, { profileVisibility: 'PUBLIC' });
    expect(onChange).toHaveBeenNthCalledWith(2, { requireApprovalConnections: false });
    expect(formData).toEqual(protectionDefaults);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('finishes the create flow through the generated player-profile action', () => {
    const onFinish = vi.fn();
    render(
      <PlayerAddedSuccessStep
        playerName="Avery Morgan"
        onFinish={onFinish}
        onAddAnother={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: "Go to Avery Morgan’s Profile" }));
    expect(onFinish).toHaveBeenCalledOnce();
  });
});
