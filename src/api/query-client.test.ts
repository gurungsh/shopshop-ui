import { describe, expect, it } from 'vitest'

import { ApiError } from './errors'
import { retryDelay, shouldRetry } from './query-client'

const apiError = (status: number, retryAfterMs: number | null = null) =>
  new ApiError(status, 'failed', null, {}, retryAfterMs)

describe('shouldRetry', () => {
  it('retries a lost connection, a 503 and a 429 twice', () => {
    for (const error of [
      new TypeError('Failed to fetch'),
      apiError(503),
      apiError(429),
    ]) {
      expect(shouldRetry(0, error)).toBe(true)
      expect(shouldRetry(1, error)).toBe(true)
      expect(shouldRetry(2, error)).toBe(false)
    }
  })

  it('does not retry a failure that a second try cannot fix', () => {
    expect(shouldRetry(0, apiError(404))).toBe(false)
    expect(shouldRetry(0, apiError(400))).toBe(false)
    expect(shouldRetry(0, apiError(500))).toBe(false)
  })
})

describe('retryDelay', () => {
  it('waits as long as Retry-After asks, up to 30 seconds', () => {
    expect(retryDelay(0, apiError(429, 5000))).toBe(5000)
    expect(retryDelay(0, apiError(429, 120_000))).toBe(30_000)
  })

  it('backs off exponentially without Retry-After', () => {
    expect(retryDelay(0, apiError(503))).toBe(1000)
    expect(retryDelay(1, apiError(503))).toBe(2000)
    expect(retryDelay(2, new TypeError('Failed to fetch'))).toBe(4000)
  })
})
