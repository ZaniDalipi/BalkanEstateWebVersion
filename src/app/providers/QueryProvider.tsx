// Query Provider - Wraps app with TanStack Query
// Provides query client and dev tools

import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../config/queryClient';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider wraps the app with TanStack Query
 *
 * Features:
 * - Provides query client to all components
 * - Includes dev tools in development mode
 * - Handles query state management
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Dev tools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
