// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/features/auth/login/LoginForm';
import { GuardianApprovalForm } from '@/components/features/auth/guardian/GuardianApprovalForm';
import { OtpCodeInput } from '@/components/common/OtpCodeInput';

afterEach(cleanup);

describe('React Hook Form authentication forms', () => {
  it('blocks invalid login input and submits a normalized valid email', async () => {
    const onSignIn = vi.fn();
    render(<LoginForm onSignIn={onSignIn} />);

    fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy();
    expect(onSignIn).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'player@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(onSignIn).toHaveBeenCalledWith('player@example.com'));
  });

  it('uses the shared guardian email validation before submission', async () => {
    const onSendRequest = vi.fn();
    render(<GuardianApprovalForm onSendRequest={onSendRequest} />);

    fireEvent.click(screen.getByRole('button', { name: /send verification request/i }));
    expect(await screen.findByText('Parent / Guardian Email is required.')).toBeTruthy();
    expect(onSendRequest).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/parent\/guardian email/i), {
      target: { value: 'guardian@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification request/i }));
    await waitFor(() => expect(onSendRequest).toHaveBeenCalledWith('guardian@example.com'));
  });

  it('reuses one accessible OTP control for sanitized paste and completion', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(<OtpCodeInput value="" onChange={onChange} onComplete={onComplete} />);
    fireEvent.change(screen.getByLabelText('Verification code digit 1'), {
      target: { value: '12a3456' },
    });
    expect(onChange).toHaveBeenCalledWith('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });
});
