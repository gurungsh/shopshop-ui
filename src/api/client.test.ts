import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { apiUrl } from '@/testing/mocks/http'
import { server } from '@/testing/mocks/server'

import { apiFetch, connectAuth } from './client'
import { ApiError } from './errors'

describe('apiFetch', () => {
  afterEach(() => {
    connectAuth({ getToken: () => null, onUnauthorized: () => undefined })
  })

  it('sends the bearer token when there is one', async () => {
    let authorization: string | null = null
    server.use(
      http.get(apiUrl('/api/ping'), ({ request }) => {
        authorization = request.headers.get('Authorization')
        return HttpResponse.json({})
      }),
    )
    connectAuth({ getToken: () => 'abc', onUnauthorized: vi.fn() })

    await apiFetch('/api/ping')

    expect(authorization).toBe('Bearer abc')
  })

  it('reports a 401 only for a request that carried a token', async () => {
    server.use(
      http.get(
        apiUrl('/api/ping'),
        () => new HttpResponse(null, { status: 401 }),
      ),
    )
    const onUnauthorized = vi.fn()

    connectAuth({ getToken: () => null, onUnauthorized })
    await expect(apiFetch('/api/ping')).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).not.toHaveBeenCalled()

    connectAuth({ getToken: () => 'abc', onUnauthorized })
    await expect(apiFetch('/api/ping')).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })
})
