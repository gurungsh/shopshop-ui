import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { ApiError } from './errors'
import { isReportable, reportError } from './report-error'

const MAX_RETRIES = 2
const MAX_DELAY_MS = 30_000

/**
 * Queries are reads, so retrying is safe, but only for failures that may pass
 * on their own: the network (fetch throws a TypeError), a 503 from the
 * gateway, or a 429 rate limit. A 404 or 400 will not change on a second try.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false
  if (error instanceof TypeError) return true
  return (
    error instanceof ApiError && (error.status === 503 || error.status === 429)
  )
}

/** Honors Retry-After when the gateway sends it, else backs off 1s, 2s, 4s... */
export function retryDelay(failureCount: number, error: unknown): number {
  if (error instanceof ApiError && error.retryAfterMs !== null) {
    return Math.min(error.retryAfterMs, MAX_DELAY_MS)
  }
  return Math.min(1000 * 2 ** failureCount, MAX_DELAY_MS)
}

function report(source: string) {
  return (error: unknown) => {
    if (isReportable(error)) reportError(error, source)
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: report('query') }),
  mutationCache: new MutationCache({ onError: report('mutation') }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
      retryDelay,
    },
  },
})
