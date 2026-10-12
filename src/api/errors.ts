export class ApiError extends Error {
  readonly status: number
  readonly correlationId: string | null
  /** From a Retry-After header in seconds, on a 429 or 503 */
  readonly retryAfterMs: number | null
  /** From a ValidationProblem: the messages for each property, by its name */
  readonly fieldErrors: Record<string, string[]>

  constructor(
    status: number,
    message: string,
    correlationId: string | null,
    fieldErrors: Record<string, string[]> = {},
    retryAfterMs: number | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.correlationId = correlationId
    this.fieldErrors = fieldErrors
    this.retryAfterMs = retryAfterMs
  }
}

export async function toApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => undefined)
  return new ApiError(
    response.status,
    messageFrom(body) ??
      `Request failed with status ${String(response.status)}`,
    response.headers.get('X-Correlation-Id'),
    fieldErrorsFrom(body),
    retryAfterFrom(response.headers.get('Retry-After')),
  )
}

function retryAfterFrom(header: string | null): number | null {
  const seconds = Number(header)
  return header !== null && Number.isFinite(seconds) && seconds >= 0
    ? seconds * 1000
    : null
}

function fieldErrorsFrom(body: unknown): Record<string, string[]> {
  if (typeof body !== 'object' || body === null || !('errors' in body))
    return {}
  if (typeof body.errors !== 'object' || body.errors === null) return {}
  return Object.fromEntries(
    Object.entries(body.errors).map(([field, messages]) => [
      field,
      Array.isArray(messages)
        ? messages.filter((m): m is string => typeof m === 'string')
        : [],
    ]),
  )
}

function messageFrom(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined
  if ('error' in body && typeof body.error === 'string') return body.error
  // ValidationProblem: { title, errors: { field: [message] } }
  if ('errors' in body && typeof body.errors === 'object' && body.errors) {
    const first: unknown = Object.values(body.errors).flat()[0]
    if (typeof first === 'string') return first
  }
  if ('title' in body && typeof body.title === 'string') return body.title
  return undefined
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404
}
