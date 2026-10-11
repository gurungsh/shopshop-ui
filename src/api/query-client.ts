import { QueryClient } from '@tanstack/react-query'

import { ApiError } from './errors'

const MAX_RETRIES = 2

/**
 * Queries are reads, so retrying is safe, but only for failures that may pass
 * on their own: the network (fetch throws a TypeError) or a 503 from the
 * gateway. A 404 or 400 will not change on a second try.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false
  if (error instanceof TypeError) return true
  return error instanceof ApiError && error.status === 503
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
    },
  },
})
