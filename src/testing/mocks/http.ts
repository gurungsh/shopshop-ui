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
