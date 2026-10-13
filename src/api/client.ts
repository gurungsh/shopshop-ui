import { env } from '@/config/env'

import { toApiError } from './errors'
import { setServiceUnavailable } from './service-status'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Sent as JSON */
  body?: unknown
  /** Lets TanStack Query cancel requests it no longer needs */
  signal?: AbortSignal
}

interface AuthHooks {
  getToken: () => string | null
  onUnauthorized: () => void
}

let auth: AuthHooks = {
  getToken: () => null,
  onUnauthorized: () => undefined,
}

export function connectAuth(hooks: AuthHooks) {
  auth = hooks
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
  const token = auth.getToken()
  const headers = new Headers()
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${env.VITE_API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  }).catch((error: unknown) => {
    // fetch rejects with a TypeError when the gateway cannot be reached
    if (error instanceof TypeError) setServiceUnavailable(true)
    throw error
  })

  setServiceUnavailable(response.status === 503)
  if (response.status === 401 && token) auth.onUnauthorized()
  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
