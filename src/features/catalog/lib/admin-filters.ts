import type { CategoryQuery, ProductQuery } from '@/api/types/catalog'
import { isGuid, PAGE_SIZE, parseAmount, parsePage } from '@/lib/list-params'

export interface AdminProductFilters {
  page: number
  name: string
  sku: string
  category: string
  min: string
  max: string
}

const PRODUCT_KEYS = ['name', 'sku', 'category', 'min', 'max'] as const

export function parseAdminProductFilters(
  params: URLSearchParams,
): AdminProductFilters {
  return {
    page: parsePage(params),
    name: params.get('name') ?? '',
    sku: params.get('sku') ?? '',
    category: params.get('category') ?? '',
    min: params.get('min') ?? '',
    max: params.get('max') ?? '',
  }
}

export function toAdminProductSearchParams(filters: AdminProductFilters) {
  const params = new URLSearchParams()
  if (filters.page > 1) params.set('page', String(filters.page))
  for (const key of PRODUCT_KEYS) {
    if (filters[key]) params.set(key, filters[key])
  }
  return params
}

export function toAdminProductQuery(
  filters: AdminProductFilters,
): ProductQuery {
  return {
    name: filters.name || undefined,
    sku: filters.sku || undefined,
    categoryIds: isGuid(filters.category) ? [filters.category] : undefined,
    minPrice: parseAmount(filters.min),
    maxPrice: parseAmount(filters.max),
    page: filters.page,
    pageSize: PAGE_SIZE,
  }
}

export interface AdminCategoryFilters {
  page: number
  name: string
}

export function parseAdminCategoryFilters(
  params: URLSearchParams,
): AdminCategoryFilters {
  return { page: parsePage(params), name: params.get('name') ?? '' }
}

export function toAdminCategorySearchParams(filters: AdminCategoryFilters) {
  const params = new URLSearchParams()
  if (filters.page > 1) params.set('page', String(filters.page))
  if (filters.name) params.set('name', filters.name)
  return params
}

export function toAdminCategoryQuery(
  filters: AdminCategoryFilters,
): CategoryQuery {
  return {
    name: filters.name || undefined,
    page: filters.page,
    pageSize: PAGE_SIZE,
  }
}
