import type { ProductQuery } from '@/api/types/catalog'

export const PAGE_SIZE = 12

export interface CatalogFilters {
  q: string
  categoryIds: string[]
  min?: number
  max?: number
  page: number
}

export const emptyFilters: CatalogFilters = {
  q: '',
  categoryIds: [],
  min: undefined,
  max: undefined,
  page: 1,
}

export function parseFilters(params: URLSearchParams): CatalogFilters {
  return {
    q: params.get('q') ?? '',
    categoryIds: params.getAll('category'),
    min: parseAmount(params.get('min')),
    max: parseAmount(params.get('max')),
    page: Math.max(1, Math.trunc(parseAmount(params.get('page')) ?? 1)),
  }
}

export function toSearchParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q.trim()) params.set('q', filters.q)
  for (const id of filters.categoryIds) params.append('category', id)
  if (filters.min !== undefined) params.set('min', String(filters.min))
  if (filters.max !== undefined) params.set('max', String(filters.max))
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}

export function toProductQuery(filters: CatalogFilters): ProductQuery {
  return {
    name: filters.q.trim() || undefined,
    categoryIds: filters.categoryIds.length ? filters.categoryIds : undefined,
    minPrice: filters.min,
    maxPrice: filters.max,
    page: filters.page,
    pageSize: PAGE_SIZE,
  }
}

export function hasFilters(filters: CatalogFilters): boolean {
  return (
    filters.q.trim() !== '' ||
    filters.categoryIds.length > 0 ||
    filters.min !== undefined ||
    filters.max !== undefined
  )
}

export function parseAmount(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined
}
