import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { connectQueryClientToDevTools } from '@/utils/tanstackDevtools';

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient;
  }
}

// Create a single instance of the QueryClient outside the component
// so it's not recreated on every render.
const queryClient = new QueryClient();

// Connect the query client to the window object for DevTools, only in development
if (process.env.NODE_ENV === 'development') {
  connectQueryClientToDevTools(queryClient);
}

interface TanstackQueryWrapperProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that sets up the TanStack Query client and provider,
 * and includes the DevTools for development environments.
 */
export function TanstackQueryWrapper({ children }: TanstackQueryWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
