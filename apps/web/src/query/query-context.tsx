import type { ReactNode } from 'react';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { globalQueryClient, type QueryClient } from '@/query/query-client';

export interface QueryProviderProps {
  client?: QueryClient;
  children: ReactNode;
}

export function QueryProvider({ client = globalQueryClient, children }: Readonly<QueryProviderProps>) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export { useQueryClient };
