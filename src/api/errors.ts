export class ApiError extends Error {
  readonly status: number
  readonly correlationId: string | null

  constructor(status: number, message: string, correlationId: string | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.correlationId = correlationId
  }
}

export async function toApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => undefined)
  return new ApiError(
    response.status,
    messageFrom(body) ??
      `Request failed with status ${String(response.status)}`,
    response.headers.get('X-Correlation-Id'),
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
