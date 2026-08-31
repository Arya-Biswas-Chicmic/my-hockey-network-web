// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  AUDIENCE_CONTACT_OPTIONS,
  PROFILE_VISIBILITY_OPTIONS,
  VISIBILITY_AUDIENCE_LABELS,
  VisibilityAudienceEnum,
} from '@my-hockey-network/contracts';
import { Dropdown } from '@/components/common/FormControls';

afterEach(cleanup);

/** The audience options as the Supervision tab builds them. */
const AUDIENCE_OPTIONS = AUDIENCE_CONTACT_OPTIONS.map((value) => ({
  value,
  label: VISIBILITY_AUDIENCE_LABELS[value],
}));

describe('visibility audience enum', () => {
  it('matches the values the backend returns for AUDIENCE controls', () => {
    expect(Object.values(VisibilityAudienceEnum)).toEqual([
      'PUBLIC',
      'HOCKEY_NETWORK',
      'CONNECTIONS',
      'HIDDEN',
    ]);
  });

  // The live payload's `allowedValues` for the follow/request/message controls
  // omits PUBLIC — it is offered for PROFILE_VISIBILITY only.
  it('offers PUBLIC for profile visibility but not for contact controls', () => {
    expect(PROFILE_VISIBILITY_OPTIONS).toContain(VisibilityAudienceEnum.PUBLIC);
    expect(AUDIENCE_CONTACT_OPTIONS).not.toContain(VisibilityAudienceEnum.PUBLIC);
    expect(AUDIENCE_CONTACT_OPTIONS).toEqual([
      'HOCKEY_NETWORK',
      'CONNECTIONS',
      'HIDDEN',
    ]);
  });

  it('gives every value a readable label', () => {
    for (const value of Object.values(VisibilityAudienceEnum)) {
      expect(VISIBILITY_AUDIENCE_LABELS[value]).toBeTruthy();
    }
  });
});

describe('Supervision audience dropdown', () => {
  // Regression: the options used to be the display strings themselves, so a
  // stored `CONNECTIONS` never matched an option and picking one sent
  // "Connections Only" straight to the API.
  it('emits the enum value, not the label, when a parent picks an option', () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        value={VisibilityAudienceEnum.HOCKEY_NETWORK}
        options={AUDIENCE_OPTIONS}
        onChange={onChange}
        placeholder=""
      />,
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: VisibilityAudienceEnum.CONNECTIONS },
    });

    expect(onChange).toHaveBeenCalledWith('CONNECTIONS');
    expect(onChange).not.toHaveBeenCalledWith('Connections Only');
  });

  it('displays the readable label for the stored enum value', () => {
    render(
      <Dropdown
        value={VisibilityAudienceEnum.CONNECTIONS}
        options={AUDIENCE_OPTIONS}
        onChange={vi.fn()}
        placeholder=""
      />,
    );

    const selected = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selected.value).toBe('CONNECTIONS');
    expect(screen.getByText('Connections Only')).toBeTruthy();
  });
});
