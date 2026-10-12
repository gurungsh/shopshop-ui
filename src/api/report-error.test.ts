import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from './errors'
import { isReportable, reportError } from './report-error'

describe('reportError', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs the correlation id of a failed call', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const error = new ApiError(502, 'Bad gateway', 'abc-123')

    reportError(error, 'query')

    expect(log).toHaveBeenCalledWith('[query]', 'correlationId=abc-123', error)
  })
})

describe('isReportable', () => {
  it('reports crashes and server errors, not client errors', () => {
    expect(isReportable(new Error('boom'))).toBe(true)
    expect(isReportable(new ApiError(500, 'x', null))).toBe(true)
    expect(isReportable(new ApiError(404, 'x', null))).toBe(false)
    expect(isReportable(new ApiError(400, 'x', null))).toBe(false)
  })
})
