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

  it('reads the first message of a validation problem', async () => {
    server.use(
      http.get(apiUrl('/api/ping'), () =>
        HttpResponse.json(
          {
            title: 'One or more validation errors occurred.',
            errors: { ShippingAddress: ['Shipping address is required.'] },
          },
          { status: 400 },
        ),
      ),
    )

    await expect(apiFetch('/api/ping')).rejects.toMatchObject({
      status: 400,
      message: 'Shipping address is required.',
    })
  })

  it('returns nothing for a 204', async () => {
    server.use(
      http.delete(
        apiUrl('/api/ping'),
        () => new HttpResponse(null, { status: 204 }),
      ),
    )

    await expect(
      apiFetch('/api/ping', { method: 'DELETE' }),
    ).resolves.toBeUndefined()
  })

  it('keeps the messages of each field of a validation problem', async () => {
    server.use(
      http.post(apiUrl('/api/ping'), () =>
        HttpResponse.json(
          { errors: { Sku: ['Sku is required.'], Price: ['Too low.'] } },
          { status: 400 },
        ),
      ),
    )

    await expect(
      apiFetch('/api/ping', { method: 'POST' }),
    ).rejects.toMatchObject({
      fieldErrors: { Sku: ['Sku is required.'], Price: ['Too low.'] },
    })
  })
})
