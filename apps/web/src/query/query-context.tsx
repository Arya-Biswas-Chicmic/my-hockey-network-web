import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { globalQueryClient, QueryClient } from './query-client';

const QueryClientContext = createContext<QueryClient>(globalQueryClient);

export interface QueryProviderProps {
  client?: QueryClient;
  children: ReactNode;
}

export function QueryProvider({ client = globalQueryClient, children }: Readonly<QueryProviderProps>) {
  const queryClient = useMemo(() => client, [client]);

  return (
    <QueryClientContext.Provider value={queryClient}>
      {children}
    </QueryClientContext.Provider>
  );
}

export function useQueryClient(): QueryClient {
  return useContext(QueryClientContext);
}
