import api from '@redux/store/api';

const authApi = api.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: body => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformErrorResponse: normalizeApiError,
    }),
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: body => ({
        url: '/auth/signup',
        method: 'POST',
        body,
      }),
      transformErrorResponse: normalizeApiError,
    }),
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: body => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
      transformErrorResponse: normalizeApiError,
    }),
  }),
  overrideExisting: false,
});

export type ApiError = {
  message: string;
  status?: number;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user?: unknown;
};

export type SignupRequest = {
  email: string;
  password: string;
  name?: string;
};

export type SignupResponse = {
  token?: string;
  user?: unknown;
  message?: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message?: string;
};

const normalizeApiError = (response: unknown): ApiError => {
  const r = response as {
    status?: number;
    data?: { message?: string; error?: string } | string;
    error?: string;
  };

  const message =
    (typeof r?.data === 'string'
      ? r.data
      : r?.data?.message || r?.data?.error) ||
    r?.error ||
    'Something went wrong. Please try again.';

  return { message, status: r?.status };
};

export const {
  useLoginMutation,
  useSignupMutation,
  useForgotPasswordMutation,
} = authApi;
