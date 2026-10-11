import { env } from '@/config/env'

import { toApiError } from './errors'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Sent as JSON */
  body?: unknown
  /** Lets TanStack Query cancel requests it no longer needs */
  signal?: AbortSignal
}

/**
 * Calls the gateway and returns the JSON response as `T`. Throws an ApiError
 * for a non-2xx response. `T` is not checked at runtime: it is a promise that
 * the types in api/types match the backend's DTOs.
 */
export async function apiFetch<T>(
  path: string,
  { method = 'GET', body, signal }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${env.VITE_API_BASE_URL}${path}`, {
    method,
    headers:
      body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  if (!response.ok) throw await toApiError(response)
  return (await response.json()) as T
}
