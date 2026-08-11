import { API_BASE_URL } from '@utils/constants';

import { RootState } from '../store';

import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
// your real baseQuery (wrapped for 401 handling)
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).common.userToken;
    if (token) headers.set('authorization', `${token}`);
    return headers;
  },
});

const baseQueryWithInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if ('error' in result) {
    const status = result?.error?.status;
    const errorData = result?.error?.data as
      | { message?: string; error?: string }
      | undefined;

    if (status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    } else {
      console.error(
        `API Error: ${status} - ${errorData?.message || errorData?.error}`,
      );
    }
  }

  return result;
};

const api = createApi({
  baseQuery: baseQueryWithInterceptor,
  endpoints: () => ({}),
});

export default api;
