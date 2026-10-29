import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

import { CivoraApiError } from "@/lib/errors/api-error";

export function createCivoraQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          if (error instanceof CivoraApiError) {
            return error.isRetryable && failureCount < 2;
          }
          return failureCount < 1;
        },
      },
      mutations: {
        // Never blindly retry mutations without explicit idempotency handling
        retry: false,
      },
    },
  });
}

export function CivoraQueryProvider({
  children,
  client,
}: {
  children: React.ReactNode;
  client?: QueryClient;
}) {
  const [defaultClient] = useState(() => client ?? createCivoraQueryClient());

  return (
    <QueryClientProvider client={defaultClient}>{children}</QueryClientProvider>
  );
}

