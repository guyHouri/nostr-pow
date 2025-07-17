import { QueryClient } from '@tanstack/react-query';

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient;
  }
}

export function connectQueryClientToDevTools(queryClient: QueryClient): void {
  window.__TANSTACK_QUERY_CLIENT__ = queryClient;
}
