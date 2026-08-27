import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '@my-hockey-network/core';
import type {
  ForgotPasswordDTO,
  ForgotPasswordResponse,
} from '@my-hockey-network/contracts';

/**
 * Request a password-reset email. Replaces the old RTK Query
 * `useForgotPasswordMutation` (`@redux/ApiReducer`) — same shared
 * `@my-hockey-network/core` -> `@my-hockey-network/auth` API service layer
 * the rest of the app already uses, now via TanStack Query instead of RTK.
 */
export function useForgotPasswordMutation() {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordDTO>({
    mutationFn: dto => forgotPassword(dto, 'mobile'),
  });
}
