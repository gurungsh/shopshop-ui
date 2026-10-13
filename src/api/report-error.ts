import { env } from '@/config/env'

import { ApiError } from './errors'

const MAX_REPORTS = 20
let reported = 0

/**
 * Sends a runtime error to the console, tagged with the gateway's correlation
 * id so it can be found in the backend's logs and traces, and to an error
 * collector when VITE_ERROR_REPORT_URL is set. Only the message, stack and ids
 * are sent: never request bodies, which can hold addresses or payment ids.
 */
export function reportError(error: unknown, source: string) {
  const correlationId =
    error instanceof ApiError ? error.correlationId : undefined
  console.error(
    `[${source}]`,
    correlationId ? `correlationId=${correlationId}` : '',
    error,
  )

  const url = env.VITE_ERROR_REPORT_URL
  if (!url || reported >= MAX_REPORTS) return
  reported++

  const report = {
    source,
    correlationId,
    status: error instanceof ApiError ? error.status : undefined,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    page: location.pathname,
  }
  navigator.sendBeacon(url, JSON.stringify(report))
}

/** Failures worth reporting: crashes and server errors, not a 404 or a validation error */
export function isReportable(error: unknown) {
  return !(error instanceof ApiError) || error.status >= 500
}
