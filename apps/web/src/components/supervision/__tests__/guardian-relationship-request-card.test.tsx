// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import {
  getGuardianRequestCode,
  GuardianRelationshipRequestCard,
} from '@/components/supervision/guardian-relationship-request-card';

afterEach(cleanup);

describe('GuardianRelationshipRequestCard', () => {
  it('renders the counterparty and delegates actions without owning API behavior', () => {
    const request = {
      id: 'request-1',
      devCode: '123456',
      counterparty: {
        id: 'parent-1',
        type: 'PROFILE',
        displayName: 'Alex Parent',
        primaryRole: 'PARENT',
      },
    };
    const onApprove = vi.fn();
    const onDecline = vi.fn();

    render(
      <GuardianRelationshipRequestCard
        request={request}
        onApprove={onApprove}
        onDecline={onDecline}
      />,
    );

    expect(screen.getByText('Alex Parent')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(onApprove).toHaveBeenCalledWith(request);
    expect(onDecline).toHaveBeenCalledWith(request);
    expect(getGuardianRequestCode(request)).toBe('123456');
  });
});
