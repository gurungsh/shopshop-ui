import { HttpResponse } from 'msw'

import type { Paged } from '@/api/types/paged'
import { env } from '@/config/env'

/** The full gateway URL for an API path, as the app calls it */
export function apiUrl(path: string): string {
  return `${env.VITE_API_BASE_URL}${path}`
}

/** The backend's error body, `{ error }` */
export function errorResponse(status: number, error: string) {
  return HttpResponse.json({ error }, { status })
}

/** Slices a list the way the backend pages it, with the same defaults */
export function paginate<T>(items: T[], page = 1, pageSize = 20): Paged<T> {
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalCount: items.length,
    totalPages: Math.ceil(items.length / pageSize),
  }
}

/** ASP.NET's ValidationProblem body, `{ title, errors }` */
export function validationProblem(errors: Record<string, string[]>) {
  return HttpResponse.json(
    {
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
      title: 'One or more validation errors occurred.',
      status: 400,
      errors,
    },
    { status: 400 },
  )
}

/** The user id (`sub`) from the mock bearer token, or null without one */
export function userIdFrom(request: Request): string | null {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '')
  const payload = token?.split('.')[1]
  if (!payload) return null

  try {
    const json = atob(payload.replaceAll('-', '+').replaceAll('_', '/'))
    const { sub } = JSON.parse(json) as { sub?: unknown }
    return typeof sub === 'string' ? sub : null
  } catch {
    return null
  }
}
