import { QueryClient, type DefaultOptions } from "@tanstack/react-query";

export const queryConfig: DefaultOptions = {
  queries: {
    // useErrorBoundary: true,
    refetchOnWindowFocus: false,
    retry: false,
  },
};

export function createQueryClient() {
  return new QueryClient({ defaultOptions: queryConfig });
}