import type { Role, UserQuery } from '@/api/types/identity'
import { PAGE_SIZE, parsePage } from '@/lib/list-params'

export const roles: Role[] = ['Admin', 'Customer']

export interface AdminUserFilters {
  page: number
  email: string
  role: Role | ''
}

export function parseAdminUserFilters(
  params: URLSearchParams,
): AdminUserFilters {
  const role = params.get('role')
  return {
    page: parsePage(params),
    email: params.get('email') ?? '',
    role: roles.find((r) => r === role) ?? '',
  }
}

export function toAdminUserSearchParams(filters: AdminUserFilters) {
  const params = new URLSearchParams()
  if (filters.page > 1) params.set('page', String(filters.page))
  if (filters.email) params.set('email', filters.email)
  if (filters.role) params.set('role', filters.role)
  return params
}

export function toAdminUserQuery(filters: AdminUserFilters): UserQuery {
  return {
    email: filters.email || undefined,
    role: filters.role || undefined,
    page: filters.page,
    pageSize: PAGE_SIZE,
  }
}
